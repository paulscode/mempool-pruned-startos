import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Fulcrum Pruned can now be chosen under Select Indexer. Like Electrs Pruned, it works with a pruned node, because it can fetch the blocks your node has already discarded.

Select Indexer no longer marks Fulcrum as recommended, and says which indexers need an archival node (Fulcrum and Electrs) and which work with a pruned one (Electrs Pruned and Fulcrum Pruned).

Nothing you have set changes, and no reindex is needed. To switch, install Fulcrum Pruned, let it finish indexing, then run Select Indexer.`

export const v_3_3_2_1 = VersionInfo.of({
  version: '3.3.2:1',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate: a fifth indexer choice is one more value the stored
    // setting may take, and no install holds it yet.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
