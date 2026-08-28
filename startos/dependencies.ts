import { T } from '@start9labs/start-sdk'
import { backends, defaultBackend, versionRange } from './backends'
import { configJson } from './file-models/mempool-config.json'
import { storeJson } from './file-models/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { selectedIndexer } from './utils'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
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

  let currentDeps = {} as Record<
    | 'bitcoind'
    | 'lnd'
    | 'c-lightning'
    | 'fulcrum'
    | 'electrs'
    | 'electrs-pruned'
    | 'tor',
    T.DependencyRequirement
  >

  const lnData = await configJson.read((c) => c.LIGHTNING).const(effects)
  const indexer = await selectedIndexer(effects)
  const backend =
    (await storeJson.read((s) => s?.backend).const(effects)) ?? defaultBackend
  const torProxy = await storeJson.read((s) => s?.torProxy).const(effects)

  if (lnData && lnData.ENABLED) {
    if (lnData.BACKEND === 'lnd') {
      currentDeps.lnd = {
        id: 'lnd',
        kind: 'running',
        versionRange: '>=0.21.1-beta:4',
        healthChecks: ['lnd', 'sync-progress'],
      }
    }

    if (lnData.BACKEND === 'cln') {
      currentDeps['c-lightning'] = {
        id: 'c-lightning',
        kind: 'running',
        versionRange: '>=26.6.6:1',
        healthChecks: ['lightningd', 'check-synced'],
      }
    }
  }

  if (torProxy) {
    currentDeps.tor = {
      id: 'tor',
      kind: 'running',
      versionRange: '>=0.4.9.11:4',
      healthChecks: ['tor'],
    }
  }

  if (indexer === 'fulcrum') {
    currentDeps.fulcrum = {
      id: 'fulcrum',
      kind: 'running',
      versionRange: '>=2.1.1:8',
      healthChecks: ['primary', 'sync-progress'],
    }
  } else if (indexer === 'electrs') {
    currentDeps.electrs = {
      id: 'electrs',
      kind: 'running',
      versionRange: '>=0.11.1:11',
      healthChecks: ['electrs', 'sync'],
    }
  } else if (indexer === 'electrs-pruned') {
    // The indexer that makes this package work against a pruned node. Same
    // health check ids as upstream electrs, because it is a fork of that
    // package rather than a separate lineage.
    currentDeps['electrs-pruned'] = {
      id: 'electrs-pruned',
      kind: 'running',
      versionRange: '>=0.11.1:24',
      healthChecks: ['electrs', 'sync'],
    }
  }

  // Exactly one node flavor, chosen by the user, plus whatever else is on.
  //
  // Return ONLY the selected backend. Listing every id and setting the
  // unselected ones to `undefined` typechecks, because the optional dependencies
  // are declared `T | undefined`, but fails at install: the host iterates the
  // returned keys and reads `.versionRange` off each value, so a
  // present-but-undefined entry is a null dereference rather than an absent
  // requirement. Omit the key instead of nulling the value.
  return {
    ...currentDeps,
    [backend]: {
      kind: 'running',
      versionRange: versionRange[backend],
      healthChecks: [...backends[backend].healthChecks],
    },
  } as any
})
