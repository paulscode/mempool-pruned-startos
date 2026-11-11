# Updating the upstream version

Mempool ships as two containers (frontend and backend) built from this package's fork of Mempool, which share a release tag and must move together, plus a MariaDB sidecar that tracks its own release line.

The fork is [`paulscode/mempool-pruned`](https://github.com/paulscode/mempool-pruned): upstream Mempool plus the changes that let it run against a pruned node and on the BLAKE2b chain. Upstream's own `mempool/frontend` and `mempool/backend` images do not work here, so a version bump is a change to the fork first and to this package second.

## Determining the upstream version

### Mempool (frontend + backend)

Check the latest upstream release, and what the fork is on:

```sh
gh release view -R mempool/mempool --json tagName -q .tagName
git -C <fork checkout> tag --list 'v*-pruned.*' --sort=-v:refname | head -3
```

The current pins live in `startos/manifest/index.ts` at `images.frontend.source.dockerTag` and `images.backend.source.dockerTag`. They are always the same tag, `v<upstream>-pruned.<n>`, and are bumped in lockstep. `<n>` restarts at 1 for each upstream version and counts the fork's own releases on top of it.

### MariaDB

The MariaDB sidecar pulls from the [`mariadb`](https://hub.docker.com/_/mariadb) Docker Hub library image. List recent tags:

```sh
curl -fsSL "https://hub.docker.com/v2/repositories/library/mariadb/tags?page_size=20&ordering=last_updated" | jq -r '.results[].name'
```

The current pin lives in `startos/manifest/index.ts` at `images.mariadb.source.dockerTag`. MariaDB has its own cadence and should only move on a deliberate decision.

## Applying the bump

### Mempool (frontend + backend)

1. In the fork, merge the upstream release tag into a new `release/v<upstream>-pruned.1` branch (or, for a fork-only change, branch from the last release and raise `<n>`). The fork's changes are few and each commit message says why it exists; resolve conflicts with that in hand.
2. Tag the result `v<upstream>-pruned.<n>` and push the tag to the fork. Its `publish-pruned-images.yml` workflow builds both images for amd64 and arm64 and pushes them to `ghcr.io/paulscode/mempool-pruned-frontend` and `ghcr.io/paulscode/mempool-pruned-backend`. Wait for it to finish.
3. In `startos/manifest/index.ts`, set both tags to it (same value in both places):
   - `images.frontend.source.dockerTag` → `ghcr.io/paulscode/mempool-pruned-frontend:v<upstream>-pruned.<n>`
   - `images.backend.source.dockerTag` → `ghcr.io/paulscode/mempool-pruned-backend:v<upstream>-pruned.<n>`

4. The Umbrel app in `paulscode/umbrel-store` pins the same two images by digest; move it to the new tag too.

Then [refresh the bundled mining pool snapshot](#refreshing-the-bundled-mining-pool-snapshot) — nothing derives it from the image tags, so it moves only when someone moves it.

### MariaDB

In `startos/manifest/index.ts`, set:

- `images.mariadb.source.dockerTag` → `mariadb:<new version>`

## Refreshing the bundled mining pool snapshot

`assets/pools-v2.json` is a vendored copy of [`mempool/mining-pools`](https://github.com/mempool/mining-pools)'s `pools-v2.json`, served on loopback by the `pools` daemon so a first start needs no network. Refresh it alongside an upstream bump, or whenever the pool definitions have moved on:

```sh
curl -fsSL -o assets/pools-v2.json https://raw.githubusercontent.com/mempool/mining-pools/master/pools-v2.json
```

Nothing else to edit — the sha the daemon reports is the file's git blob hash, computed at runtime. Confirm it matches what GitHub serves for the same content:

```sh
git hash-object assets/pools-v2.json
gh api repos/mempool/mining-pools/git/trees/master --jq '.tree[] | select(.path=="pools-v2.json") | .sha'
```

**Check one upstream detail at every version bump.** `backend/src/tasks/pools-updater.ts` installs its SOCKS agent as `httpsAgent` only:

```ts
axiosOptions.httpsAgent = new SocksProxyAgent(socksOptions)
```

Axios picks `httpAgent` for an `http:` URL, so the loopback fetch is exempt from the proxy and keeps working with Tor egress enabled. If a release adds `httpAgent` alongside it — `sync-assets.ts` already sets both — then a fresh install with the Tor action on would try to reach `127.0.0.1` through Tor, fail, and crash-loop on the missing sha. Serving the snapshot over TLS is the fix if that day comes.

A refreshed snapshot only reaches installs whose database has no `pools_json_sha` yet — a fresh install or a restore. Upstream's `AUTOMATIC_POOLS_UPDATE` is off, so an install that already imported pool data logs that an update is available and keeps what it has.

## Cutting a release of this package

1. Move the old `startos/versions/current.ts` to `startos/versions/v<old>.ts`, list it under `other` in `startos/versions/index.ts`, and write the new `current.ts` with its notes and any migration. A released version keeps its file even when its migration is empty, for the notes.
2. From the workspace root, `./release.sh mempool-pruned-startos` builds the universal s9pk into `builds/<dotted version>/` beside an unsigned `SHA256SUMS`. It refuses a tree that differs from HEAD.
3. Sign `SHA256SUMS` on the air-gapped machine and put `SHA256SUMS.asc` beside it.
4. `./release.sh mempool-pruned-startos --publish` pushes the branch and cuts the GitHub release `v<dotted version>`. Then publish to the registry from its own repository.

GitHub Actions only type-checks (`.github/workflows/check.yml`); nothing is built or released there.
