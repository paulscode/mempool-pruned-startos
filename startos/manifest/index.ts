import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'mempool-pruned',
  title: 'Mempool Pruned',
  license: 'AGPL',
  packageRepo: 'https://github.com/paulscode/mempool-pruned-startos',
  upstreamRepo: 'https://github.com/mempool/mempool',
  marketingUrl: 'https://mempool.space',
  donationUrl: 'https://mempool.space/sponsor',
  description: { short, long },
  // StartOS 0.4.0.2, so the registry hides this release from 0.4.0.1 servers. Its
  // Bitcoin Knots (pre-RDTS) floor, 29.3:29, cannot be installed there; 3.3.1:41
  // serves them. See `backends.ts`. SDK 3 defaults to 0.4.0.2 anyway; this stays
  // explicit so the reason is written down.
  osVersion: '0.4.0.2',
  volumes: ['main', 'cache', 'db', 'config', 'startos'],
  images: {
    frontend: {
      source: {
        dockerTag: 'ghcr.io/paulscode/mempool-pruned-frontend:v3.3.1-pruned.8',
      },
      arch: ['x86_64', 'aarch64'],
    },
    backend: {
      source: {
        dockerTag: 'ghcr.io/paulscode/mempool-pruned-backend:v3.3.1-pruned.8',
      },
      arch: ['x86_64', 'aarch64'],
    },
    mariadb: {
      source: {
        dockerTag: 'mariadb:10.4.34',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
