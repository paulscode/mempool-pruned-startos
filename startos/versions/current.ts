import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Fixes address lookups silently doing nothing when no indexer was ever chosen.

The Select Indexer form preselected Fulcrum without having stored it, so closing the form looked like a choice and saved nothing, and the prompt that would have forced the choice only appeared on a fresh install. An install that updated into the feature was never asked at all. With the choice unmade, no indexer dependency was declared and no Electrum address was written, but the backend was still told to use one, so it fell back to upstream's own defaults and hammered this package's database once a second instead. Both health checks stayed green the whole time.

Now nothing is preselected, so a choice has to be made; the prompt is raised whenever the choice is unmade rather than only at install, which reaches an install already in this state on its next start; and the backend setting follows whether an Electrum address actually resolved, so it is never left on upstream's defaults. "None" is an explicit option: address lookups off, everything else working.

Ported from Start9Labs/mempool-startos#83, which found and fixed this upstream.

Also renames one entry in the node picklist. The pre-RDTS companion node is now called "Bitcoin Knots (SHA256) Companion", and the picklist and the dependency prompt follow it. Only the label changed: same package, same id, so an existing selection keeps working and nothing reindexes.`

export const current = VersionInfo.of({
  version: '3.3.1:36',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate. Both halves of the indexer fix heal on the next
    // start: watchHosts rewrites MEMPOOL.BACKEND on every init, and the task is
    // raised from the stored selection rather than from the install edge, so an
    // install sitting in the broken state is repaired without a version hop.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
