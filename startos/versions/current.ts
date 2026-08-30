import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { EXTERNAL_RETRY } from '../utils'

export const current = VersionInfo.of({
  version: '3.3.1:25',
  releaseNotes: {
    en_US: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed.

This does not affect any other chain.`,
    es_ES: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed.

This does not affect any other chain.`,
    de_DE: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed.

This does not affect any other chain.`,
    pl_PL: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed.

This does not affect any other chain.`,
    fr_FR: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed.

This does not affect any other chain.`,
  },
  migrations: {
    up: async ({ effects }) => {
      // The file model's defaults only reach missing or invalid keys, and an
      // older install already holds a valid EXTERNAL_MAX_RETRY of 1.
      await configJson.merge(effects, { MEMPOOL: EXTERNAL_RETRY })
      // Replay keys left behind by bitcoind's two config-action renames. They
      // still demand `prune: 0, txindex: true`, so they collide the moment
      // Mempool asks bitcoind for anything else (issue #73). clearTask filters
      // by id, so an install that never wrote them is unaffected.
      await sdk.action.clearTask(
        effects,
        'bitcoind:config',
        'bitcoind:other-config',
      )
    },
    down: IMPOSSIBLE,
  },
})
