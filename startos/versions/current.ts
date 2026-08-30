import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.3.1:32',
  releaseNotes: {
    en_US: `Select Node's first option is now called Bitcoin Knots rather than Bitcoin Core. Both are the same StartOS service and share one entry, so the name is only a label for whichever you have installed, including a BLAKE2b build sideloaded over either. It reads as Knots because that is what nearly everyone running this explorer is running. If you are on Core, this is still your option. Nothing about which service is selected has changed, and no re-index or cache clear is needed.`,
    es_ES: `Select Node's first option is now called Bitcoin Knots rather than Bitcoin Core. Both are the same StartOS service and share one entry, so the name is only a label for whichever you have installed, including a BLAKE2b build sideloaded over either. It reads as Knots because that is what nearly everyone running this explorer is running. If you are on Core, this is still your option. Nothing about which service is selected has changed, and no re-index or cache clear is needed.`,
    de_DE: `Select Node's first option is now called Bitcoin Knots rather than Bitcoin Core. Both are the same StartOS service and share one entry, so the name is only a label for whichever you have installed, including a BLAKE2b build sideloaded over either. It reads as Knots because that is what nearly everyone running this explorer is running. If you are on Core, this is still your option. Nothing about which service is selected has changed, and no re-index or cache clear is needed.`,
    pl_PL: `Select Node's first option is now called Bitcoin Knots rather than Bitcoin Core. Both are the same StartOS service and share one entry, so the name is only a label for whichever you have installed, including a BLAKE2b build sideloaded over either. It reads as Knots because that is what nearly everyone running this explorer is running. If you are on Core, this is still your option. Nothing about which service is selected has changed, and no re-index or cache clear is needed.`,
    fr_FR: `Select Node's first option is now called Bitcoin Knots rather than Bitcoin Core. Both are the same StartOS service and share one entry, so the name is only a label for whichever you have installed, including a BLAKE2b build sideloaded over either. It reads as Knots because that is what nearly everyone running this explorer is running. If you are on Core, this is still your option. Nothing about which service is selected has changed, and no re-index or cache clear is needed.`,
  },
  migrations: {
    // Nothing to migrate. This version changes one option's label; the stored
    // value behind it is the package id `bitcoind`, which has not moved, so no
    // install needs rewriting and no database is rebuilt.
    //
    // The RDTS remap, retry default and stale-task cleanup that :31 needed live
    // in `v3.3.1_31.ts`, with the version that introduced them.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
