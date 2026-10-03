import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Lightning Fork can now be the explorer's Lightning node, and the Lightning pages work against a pruned node.

Enable Lightning offers Lightning Fork (BLAKE2b) beside LND and Core Lightning. The explorer reads Lightning Fork's network graph the way it reads LND's, using its read-only credentials. Lightning Fork runs on the BLAKE2b chain, so it cannot be chosen while the explorer follows the node on the SHA256 chain.

The Lightning pages left out every channel on a pruned node. To date a channel and size it, the explorer looked up the transaction that opened it, which a node can only do by its id with a full transaction index, and a pruned node cannot keep one. Each lookup failed, so channels had no age or capacity history and the network statistics stayed empty. It now takes a channel's capacity from the Lightning node, which already knows it, and its date from the block header, which a pruned node keeps for every block. Where it still needs the transaction itself, it reads it from the block in one call. Nothing you have set changes and no reindex is needed; the statistics fill in at the next hourly run.`

export const current = VersionInfo.of({
  version: '3.3.1:39',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate. An install that already uses LND has no
    // lightningPackage in its store, which reads as 'lnd', so it carries on
    // exactly as before. The backend change is in the image and reads only what
    // the Lightning node and the bitcoin node already provide.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
