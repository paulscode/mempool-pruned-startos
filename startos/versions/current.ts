import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Keeps the difficulty figure working against a Bitcoin Knots node on the BLAKE2b chain.

Knots 29.4.2.knots20260508 changed two things this reads. A block with the new header format reports "difficulty_blake2b" and no longer reports "difficulty" at all, so against an updated node every block arrived with no difficulty and the figure stopped being recorded. And the getdifficulty RPC was removed outright, which the hashrate chart called and quietly fell back to zero on.

Both now read whichever name applies, so blocks either side of the BLAKE2b activation work and the current difficulty is reported again.

Nothing else changes and no reindex is needed. Blocks recorded while the figure was missing keep whatever was stored for them; the chart fills in again from here.`

export const current = VersionInfo.of({
  version: '3.3.1:38',
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
