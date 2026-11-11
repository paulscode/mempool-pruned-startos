import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Mempool 3.3.2. The backend now runs on Node.js 26.12.1, which fixes the Node.js security issues published on 21 October 2026, among them a remote code execution flaw in its Brotli decoder and two ways to get past TLS hostname checks.

The backend no longer trusts certificates issued under the compromised eMudhra certificate authorities, in either Node.js's own list or the system's.

A request asking the backend to evaluate a transaction with thousands of inputs and outputs is now refused instead of tying up the backend.

The mining pools list recognizes one more pool address.

Nothing you have set changes, and no reindex is needed.`

export const v_3_3_2_0 = VersionInfo.of({
  version: '3.3.2:0',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate: only the images changed.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
