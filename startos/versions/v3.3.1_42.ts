import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `For StartOS 0.4.0.2. If Select Node is on Bitcoin Knots (pre-RDTS), that node must be at least 29.3:29 again.

29.3:29 fixes two faults in the node's RPC proxy, each of which stopped the explorer until something was restarted. Some blocks mined in the months before SegWit activated could not be fetched from any peer, and fetching from peers is how the explorer reads every block a pruned node has discarded. And after the node restarted on its own, the proxy kept refusing the explorer's login until the Bitcoin service was restarted.

3.3.1:41 accepted 29.3:28, because 29.3:29 needs StartOS 0.4.0.2. This release is offered only on StartOS 0.4.0.2, where 29.3:29 can be installed. If your node is still on 29.3:28, update Bitcoin Knots (pre-RDTS) to 29.3:29 before or right after this update; until then, Mempool Pruned shows its Bitcoin dependency as unmet.

Nothing changes for Bitcoin Core, Bitcoin Knots, or the two companion nodes, and no reindex is needed.`

/**
 * 3.3.1:42, preserved with its release notes, as `v3.3.1_34.ts` explains. The last
 * release built on start-sdk 2.0.9, and the first to declare StartOS 0.4.0.2.
 */
export const v_3_3_1_42 = VersionInfo.of({
  version: '3.3.1:42',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate: only a dependency range and the declared StartOS
    // version changed, which StartOS and the registry check.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
