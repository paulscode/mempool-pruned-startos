import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../file-models/store.json'
import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { EXTERNAL_RETRY } from '../utils'

export const current = VersionInfo.of({
  version: '3.3.1:29',
  releaseNotes: {
    en_US: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed. This does not affect any other chain.

The Bitcoin Knots (RDTS) Companion has been removed from Select Node. It no longer has a chain of its own: the RDTS rules now take effect at the BLAKE2b fork rather than activating separately, so that option and Knots (BLAKE2b) Companion were two names for the same destination. If your explorer was pointed at it, it now points at Knots (BLAKE2b) Companion.

That is a change of chain, so clear the backend cache once after upgrading. The database is built against whichever chain it was indexing.`,
    es_ES: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed. This does not affect any other chain.

The Bitcoin Knots (RDTS) Companion has been removed from Select Node. It no longer has a chain of its own: the RDTS rules now take effect at the BLAKE2b fork rather than activating separately, so that option and Knots (BLAKE2b) Companion were two names for the same destination. If your explorer was pointed at it, it now points at Knots (BLAKE2b) Companion.

That is a change of chain, so clear the backend cache once after upgrading. The database is built against whichever chain it was indexing.`,
    de_DE: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed. This does not affect any other chain.

The Bitcoin Knots (RDTS) Companion has been removed from Select Node. It no longer has a chain of its own: the RDTS rules now take effect at the BLAKE2b fork rather than activating separately, so that option and Knots (BLAKE2b) Companion were two names for the same destination. If your explorer was pointed at it, it now points at Knots (BLAKE2b) Companion.

That is a change of chain, so clear the backend cache once after upgrading. The database is built against whichever chain it was indexing.`,
    pl_PL: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed. This does not affect any other chain.

The Bitcoin Knots (RDTS) Companion has been removed from Select Node. It no longer has a chain of its own: the RDTS rules now take effect at the BLAKE2b fork rather than activating separately, so that option and Knots (BLAKE2b) Companion were two names for the same destination. If your explorer was pointed at it, it now points at Knots (BLAKE2b) Companion.

That is a change of chain, so clear the backend cache once after upgrading. The database is built against whichever chain it was indexing.`,
    fr_FR: `Fixes indexing on the BLAKE2b chain. Blocks there carry a header that is longer than a normal Bitcoin one, and the database column holding it was sized for exactly the normal length, so the first block after the fork either failed to store or was stored cut in half. The column is widened on upgrade; nothing you have set changes, and no re-index is needed. This does not affect any other chain.

The Bitcoin Knots (RDTS) Companion has been removed from Select Node. It no longer has a chain of its own: the RDTS rules now take effect at the BLAKE2b fork rather than activating separately, so that option and Knots (BLAKE2b) Companion were two names for the same destination. If your explorer was pointed at it, it now points at Knots (BLAKE2b) Companion.

That is a change of chain, so clear the backend cache once after upgrading. The database is built against whichever chain it was indexing.`,
  },
  migrations: {
    up: async ({ effects }) => {
      // `knots-rdts` is no longer offered, so an install pointed at it would fall
      // back to the default on read and quietly start reading a different chain.
      // Map it to `knots-blake2b` instead, which is the node that replaced it:
      // Knots rc4 activates the RDTS rules at the BLAKE2b fork height rather than
      // through versionbits, so there is no separate RDTS chain to follow.
      //
      // This still changes which chain the explorer indexes, and the database is
      // built against the chain it was indexing. The release notes say to clear
      // the backend cache, and the Select Node action carries the same warning.
      // Doing it here rather than leaving the fallback to pick means the
      // destination is the successor rather than whichever node happens to be
      // first in the list.
      const backend = await storeJson.read((s) => s?.backend).once()
      if ((backend as string) === 'knots-rdts') {
        await storeJson.merge(effects, { backend: 'knots-blake2b' })
      }

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
