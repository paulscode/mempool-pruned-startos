import { T } from '@start9labs/start-sdk'
import { BackendId, backends, defaultBackend, versionRange } from './backends'
import { configJson } from './fileModels/mempool-config.json'
import { storeJson } from './fileModels/store.json'
import {
  bitcoindDescription,
  clnDescription,
  electrsDescription,
  fulcrumDescription,
  lndDescription,
  torDescription,
} from './manifest/i18n'
import { sdk } from './sdk'
import { IndexerChoice, selectedIndexer, settled } from './utils'

// There is deliberately no autoconfig task here, and its absence is the whole
// point of this package.
//
// Upstream raises a `critical` task forcing `prune: 0` and `txindex: true`,
// because Mempool resolves a confirmed transaction through
// `getrawtransaction` with no blockhash, which only txindex can answer. And
// txindex cannot coexist with pruning: bitcoind refuses to start with both.
//
// The fork this package ships resolves confirmed transactions through Electrum
// instead, so neither is needed. Pruning is permitted rather than tolerated,
// and an archival node is unaffected. Do not reintroduce the task: if
// something here seems to want it, the bug is elsewhere.
//
// Every dependency is optional, and each is enabled by the choice stored for
// it: exactly one node flavor, chosen by the user under Select Node, plus
// whatever else is on. Declaring bitcoind required would demand the official
// package of someone running a companion node. Each `enabled` re-runs on its
// own when the file it reads changes, and only enabled entries are published
// to StartOS, so a switch moves the requirement from one id to the other.

const selectedBackend = async (effects: T.Effects): Promise<BackendId> =>
  (await settled(() => storeJson.read((s) => s?.backend).const(effects))) ??
  defaultBackend

/**
 * Which Lightning package the explorer reads, or null while Lightning is off.
 * Mempool's own config says only `lnd` or `cln`; which package serves `lnd`,
 * Start9's LND or Lightning Fork, is StartOS state in store.json.
 */
const selectedLightning = async (
  effects: T.Effects,
): Promise<'lnd' | 'lightning-fork' | 'c-lightning' | null> => {
  const lnData = await settled(() =>
    configJson.read((c) => c.LIGHTNING).const(effects),
  )
  if (!lnData?.ENABLED) return null
  if (lnData.BACKEND === 'cln') return 'c-lightning'
  return (
    (await settled(() =>
      storeJson.read((s) => s?.lightningPackage).const(effects),
    )) ?? 'lnd'
  )
}

const backendIcons: Record<BackendId, string> = {
  bitcoind:
    'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/refs/heads/30.x/dep-icon.svg',
  'knots-prerdts':
    'https://raw.githubusercontent.com/paulscode/knots-prerdts-startos/main/dep-icon.png',
  'knots-blake2b':
    'https://raw.githubusercontent.com/paulscode/knots-blake2b-startos/main/dep-icon.png',
}

const backend = (id: BackendId) =>
  sdk.Dependency.optional(id, {
    description: bitcoindDescription,
    metadata: { title: backends[id].title, icon: backendIcons[id] },
    kind: 'running',
    versionRange: versionRange[id],
    healthChecks: [...backends[id].healthChecks],
    enabled: async ({ effects }) => (await selectedBackend(effects)) === id,
  })

const indexerEnabled =
  (id: IndexerChoice) =>
  async ({ effects }: { effects: T.Effects }) =>
    (await selectedIndexer(effects)) === id

const fulcrum = sdk.Dependency.optional('fulcrum', {
  description: fulcrumDescription,
  metadata: {
    title: 'Fulcrum',
    icon: 'https://raw.githubusercontent.com/Start9Labs/fulcrum-startos/master/icon.png',
  },
  kind: 'running',
  versionRange: '>=2.1.1:8',
  healthChecks: ['primary', 'sync-progress'],
  enabled: indexerEnabled('fulcrum'),
})

const electrs = sdk.Dependency.optional('electrs', {
  description: electrsDescription,
  metadata: {
    title: 'Electrs',
    icon: 'https://raw.githubusercontent.com/Start9Labs/electrs-startos/refs/heads/master/icon.svg',
  },
  kind: 'running',
  versionRange: '>=0.11.1:11',
  healthChecks: ['electrs', 'sync'],
  enabled: indexerEnabled('electrs'),
})

// The indexer that makes this package work against a pruned node. Same health
// check ids as upstream electrs, because it is a fork of that package rather
// than a separate lineage.
const electrsPruned = sdk.Dependency.optional('electrs-pruned', {
  description: electrsDescription,
  metadata: {
    title: 'Electrs Pruned',
    icon: 'https://raw.githubusercontent.com/paulscode/electrs-pruned-startos/master/dep-icon.png',
  },
  kind: 'running',
  versionRange: '>=0.11.1:24',
  healthChecks: ['electrs', 'sync'],
  enabled: indexerEnabled('electrs-pruned'),
})

const lnd = sdk.Dependency.optional('lnd', {
  description: lndDescription,
  metadata: {
    title: 'LND',
    icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
  },
  kind: 'running',
  versionRange: '>=0.21.1-beta:4',
  healthChecks: ['lnd', 'sync-progress'],
  enabled: async ({ effects }) => (await selectedLightning(effects)) === 'lnd',
})

// Lightning Fork also answers whether its node is on the BLAKE2b chain: waited
// on too, since its graph means nothing to an explorer of another chain.
// 0.21.3-beta.16 is the first that pays BOLT 12 offers on mainnet, and the one
// this was tested against.
const lightningFork = sdk.Dependency.optional('lightning-fork', {
  description: lndDescription,
  metadata: {
    title: 'Lightning Fork',
    icon: 'https://raw.githubusercontent.com/paulscode/lightning-fork-startos/master/icon.png',
  },
  kind: 'running',
  versionRange: '>=0.21.3-beta.16:0',
  healthChecks: ['lnd', 'sync-progress', 'chain-identity'],
  enabled: async ({ effects }) =>
    (await selectedLightning(effects)) === 'lightning-fork',
})

const cln = sdk.Dependency.optional('c-lightning', {
  description: clnDescription,
  metadata: {
    title: 'Core Lightning',
    icon: 'https://raw.githubusercontent.com/Start9Labs/cln-startos/refs/heads/master/icon.svg',
  },
  kind: 'running',
  versionRange: '>=26.6.6:1',
  healthChecks: ['lightningd', 'check-synced'],
  enabled: async ({ effects }) =>
    (await selectedLightning(effects)) === 'c-lightning',
})

const tor = sdk.Dependency.optional('tor', {
  description: torDescription,
  metadata: {
    title: 'Tor',
    icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
  },
  kind: 'running',
  versionRange: '>=0.4.9.11:4',
  healthChecks: ['tor'],
  enabled: async ({ effects }) =>
    !!(await settled(() => storeJson.read((s) => s?.torProxy).const(effects))),
})

export const dependencies = sdk.Dependencies.of()
  .addDependency(backend('bitcoind'))
  .addDependency(backend('knots-prerdts'))
  .addDependency(backend('knots-blake2b'))
  .addDependency(electrs)
  .addDependency(electrsPruned)
  .addDependency(fulcrum)
  .addDependency(lightningFork)
  .addDependency(cln)
  .addDependency(lnd)
  .addDependency(tor)
