import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `The Bitcoin node must be a recent enough revision, and each setting now describes its options.

If Select Node is on Bitcoin Knots, that node must be at least 28.4:29, 29.4:16, 30.3:16 or 31.1:16, depending on its version line, or 29.3:29 for Bitcoin Knots (pre-RDTS). Those revisions fix two faults in the node's RPC proxy, each of which stopped the explorer until something was restarted. Some blocks mined in the months before SegWit activated could not be fetched from any peer, and fetching from peers is how the explorer reads every block a pruned node has discarded. And after the node restarted, the proxy kept refusing the explorer's login until the proxy itself was restarted. The two companion nodes must likewise be at least Bitcoin Knots (BLAKE2b) Companion 1.0.0:32 or Bitcoin Knots (pre-RDTS) Companion 29.3:29, which carry the same fixes; their current releases already do. A Bitcoin Knots build that declares none of these revisions is refused; for this chain's BLAKE2b node, select the Bitcoin Knots (BLAKE2b) Companion.

Select Indexer, Enable Lightning and Indexing and Performance now list each of their options and what it does. The Spanish, German, Polish and French text has its accented letters back.

A key added to the configuration file by hand is now kept when the package rewrites the file, even if the package does not know that key.

Nothing you have set changes and no reindex is needed.`

export const current = VersionInfo.of({
  version: '3.3.1:40',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate. The new version floor is a dependency requirement,
    // checked by StartOS, and the file models only stopped dropping keys they
    // do not model, which needs nothing done to existing files.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
