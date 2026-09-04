import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:35',
  releaseNotes: {
    en_US: `Renames one entry in the Bitcoin service picklist. The pre-RDTS companion node is now called "Bitcoin Knots (SHA256) Companion", and this picklist and the dependency prompt follow it.\n\nOnly the label changed. It is the same package with the same id, so an existing selection keeps working and nothing reindexes.`,
    es_ES: `Renames one entry in the Bitcoin service picklist. The pre-RDTS companion node is now called "Bitcoin Knots (SHA256) Companion", and this picklist and the dependency prompt follow it.\n\nOnly the label changed. It is the same package with the same id, so an existing selection keeps working and nothing reindexes.`,
    de_DE: `Renames one entry in the Bitcoin service picklist. The pre-RDTS companion node is now called "Bitcoin Knots (SHA256) Companion", and this picklist and the dependency prompt follow it.\n\nOnly the label changed. It is the same package with the same id, so an existing selection keeps working and nothing reindexes.`,
    pl_PL: `Renames one entry in the Bitcoin service picklist. The pre-RDTS companion node is now called "Bitcoin Knots (SHA256) Companion", and this picklist and the dependency prompt follow it.\n\nOnly the label changed. It is the same package with the same id, so an existing selection keeps working and nothing reindexes.`,
    fr_FR: `Renames one entry in the Bitcoin service picklist. The pre-RDTS companion node is now called "Bitcoin Knots (SHA256) Companion", and this picklist and the dependency prompt follow it.\n\nOnly the label changed. It is the same package with the same id, so an existing selection keeps working and nothing reindexes.`,
  },
  migrations: {
    // Nothing to migrate. Both changes are in the backend image: which route reads a
    // block's transactions, and what a block is labelled with when no pool matches.
    // Neither touches stored config or the database schema, and blocks already indexed
    // keep their rows. The miner name is derived on read from the coinbase the blocks
    // table already stores, so it appears on old blocks too without a re-index.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
