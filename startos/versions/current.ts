import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Rebuilt on version 3 of the StartOS packaging SDK, which needs StartOS 0.4.0.2. Nothing you have set changes.`

export const current = VersionInfo.of({
  version: '3.3.1:43',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate: only the packaging SDK changed. Both file models were
    // already z.looseObject, so keys they do not model survive the first write
    // under SDK 3 as they did before.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
