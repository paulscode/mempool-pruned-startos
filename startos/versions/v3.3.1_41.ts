import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Bitcoin Knots (pre-RDTS) 29.3:28 is accepted again, so Mempool Pruned works on StartOS 0.4.0.1 with that node.

3.3.1:40 required 29.3:29 for Bitcoin Knots (pre-RDTS). That version needs StartOS 0.4.0.2, so on StartOS 0.4.0.1 the newest you can install is 29.3:28, and Mempool Pruned 3.3.1:40 reported its Bitcoin dependency as unmet. If that happened to you, this update clears it; nothing else needs doing.

29.3:28 still ships the older RPC proxy, with two known faults. Some blocks mined in the months before SegWit activated cannot be fetched from peers, which matters only if the explorer or its indexer needs one of those blocks from a pruned node. And if the node restarts on its own, the proxy refuses the explorer's login until the Bitcoin service is restarted. Both were present before 3.3.1:40 as well. To be rid of them, update StartOS to 0.4.0.2 and then Bitcoin Knots (pre-RDTS) to 29.3:29.

Nothing changes for Bitcoin Core, Bitcoin Knots, or the two companion nodes, and no reindex is needed.`

/**
 * 3.3.1:41, preserved with its release notes, as `v3.3.1_34.ts` explains. It is still
 * the newest release on StartOS 0.4.0.1: 3.3.1:42 declares StartOS 0.4.0.2, and the
 * registry hides it from older servers.
 */
export const v_3_3_1_41 = VersionInfo.of({
  version: '3.3.1:41',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate: only a dependency range changed, which StartOS checks.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
