import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { storeJson } from '../file-models/store.json'
import { configJson } from '../file-models/mempool-config.json'
import { sdk } from '../sdk'
import { EXTERNAL_RETRY } from '../utils'

/**
 * 3.3.1:31, spun off so its migration stays with the version that introduced it.
 *
 * The RDTS remap, the retry default and the stale-task cleanup all shipped in
 * :31. A migration belongs to the version that needed it and is not carried
 * forward into a successor, so :32 declares a clean one and the work stays here.
 * An install below :31 still runs it on the way up: `VersionGraph` synthesizes a
 * range vertex beneath `current`, so the hop passes through this node.
 */
export const v_3_3_1_31 = VersionInfo.of({
  version: '3.3.1:31',
  releaseNotes: {
    en_US:
      'Widened the block header column so a 164-byte BLAKE2b header fits, and ' +
      'removed the RDTS node from Select Node, since the RDTS rules now take ' +
      'effect at the BLAKE2b fork rather than activating separately.',
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
