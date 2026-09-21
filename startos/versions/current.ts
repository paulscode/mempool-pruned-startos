import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Keeps the difficulty figure working against a Bitcoin Knots node on the BLAKE2b chain.

Knots 29.4.2.knots20260508 splits the RPC field this reads: a block with the new header format reports "difficulty_blake2b" and no longer reports "difficulty" at all. On that chain every block since 961640 has the new header, so against an updated node every block arrived here with no difficulty and the figure stopped being recorded. This release reads whichever name the block carries, so a block from before the change and one from after both work.

Nothing else changes, and no reindex is needed. Blocks recorded while the figure was missing keep whatever was stored for them; the difficulty chart fills in again from this release onwards.`

export const current = VersionInfo.of({
  version: '3.3.1:37',
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
