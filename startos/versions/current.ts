import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Rebuilt on version 3 of the StartOS packaging SDK, which needs StartOS 0.4.0.2. Nothing you have set changes.

The backend no longer keeps every replacement (RBF) event in memory for as long as it runs.

The backend's dependencies are updated to fix published security advisories, including a denial of service in its WebSocket library.

Mempool starts sooner once its database is ready, instead of waiting up to 30 seconds for the next check.

Retropex's BLAKE2b build of Bitcoin Knots (29.4.2:4 or later) is accepted as the Bitcoin node again. On a pruned Retropex node, its stock RPC proxy can still stall Mempool, so an unpruned node is the safe choice there.`

export const current = VersionInfo.of({
  version: '3.3.1:44',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate: only the packaging SDK changed. Both file models were
    // already z.looseObject, so keys they do not model survive the first write
    // under SDK 3 as they did before.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
