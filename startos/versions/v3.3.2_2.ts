import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Security update for the backend.

One visitor could crash Mempool by exhausting its memory over the live-update connection, by sending pings and never reading the replies (GHSA-37g9-w4hg-h9qr). The WebSocket library is now 8.23.0, which bounds that queue.

One compressed request with extra bytes after the body could crash the backend (GHSA-27r3-jxmh-p828). Fixed by body-parser 1.20.9.

The HTTP client now uses follow-redirects 1.16.3, which keeps credentials from following a redirect (CVE-2026-116689).

The backend runs on Node.js 26.13.1, the November 2026 Node.js security release.

Nothing you have set changes, and no reindex is needed.`

export const v_3_3_2_2 = VersionInfo.of({
  version: '3.3.2:2',
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
