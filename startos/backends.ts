import {
  rpcHostId as btcRpcHostId,
  rpcPort as btcRpcPort,
} from 'bitcoin-core-startos/startos/utils'
import {
  rpcHostId as b2bRpcHostId,
  rpcPort as b2bRpcPort,
} from 'knots-blake2b-startos/startos/utils'

/**
 * Where a backend's RPC lives inside its own container.
 *
 * Only RPC, unlike the same file in `electrs-pruned`, which also carries a
 * whitelisted p2p endpoint. Mempool never pulls blocks over p2p: it reads them
 * over RPC and gets address history from the indexer, so there is no second
 * endpoint to resolve.
 */
type Endpoints = {
  rpcHostId: string
  rpcPort: number
}

/**
 * The health checks a backend must be passing before Mempool should index it.
 *
 * Per backend rather than one list for all of them, because the ids are not
 * shared. StartOS looks each id up in the dependency's own health results and
 * treats a miss exactly like a failure: `dep.statusInfo.health[id]` is
 * `undefined`, `undefined !== 'success'`, and the UI shows "Required health
 * check not passing" for a check that does not exist. Nothing clears it, and the
 * warning cannot even name the check, because there is no name to read. That
 * cost `electrs-pruned` a release to learn; it is written down here so it does
 * not cost this package one too.
 *
 * The official package and its two mainnet forks run a daemon `bitcoind` with a
 * `sync-progress` check beside it. `knots-blake2b` is a separate lineage and
 * runs a daemon `node` with a `chain` check, which answers a different question:
 * on testnet4 the fork shares magic bytes, port and genesis with ordinary
 * testnet4, so "synced" is not the thing worth asserting. Which chain the node
 * is on is.
 */
type BackendHealthChecks = readonly string[]

/**
 * Written out rather than imported, unlike the endpoints below: a health check
 * id is not exported by the packages that declare it, so this is the one thing
 * here that a rename upstream would break silently rather than at compile time.
 */
const officialHealthChecks: BackendHealthChecks = ['bitcoind', 'sync-progress']
const blake2bHealthChecks: BackendHealthChecks = ['node', 'chain']

/**
 * The official package and its two mainnet forks share these, because the forks
 * change only their host-side `preferredExternalPort` values. Imported rather
 * than written out, so a change upstream reaches us as a type error.
 */
const officialEndpoints: Endpoints = {
  rpcHostId: btcRpcHostId,
  rpcPort: btcRpcPort,
}

/**
 * The bitcoind flavors this package can run against.
 *
 * All four are declared as optional dependencies in the manifest and exactly one
 * is returned as required from `dependencies.ts`, chosen by the user. The SDK
 * evaluates `setupDependencies` at runtime, so a conditional requirement is a
 * supported shape rather than a trick.
 */
export const backends = {
  bitcoind: {
    title: 'Bitcoin',
    endpoints: officialEndpoints,
    healthChecks: officialHealthChecks,
  },
  // `knots-rdts` was here and is not any more. RDTS no longer has a chain of
  // its own: Knots rc4 removed the versionbits deployment and activates those
  // rules at the BLAKE2b fork height instead, so the RDTS variant and the
  // BLAKE2b one stopped being two things to choose between. The package still
  // exists; this explorer just has no reason to offer it.
  'knots-prerdts': {
    title: 'Bitcoin Knots (pre-RDTS) Companion',
    endpoints: officialEndpoints,
    healthChecks: officialHealthChecks,
  },
  'knots-blake2b': {
    title: 'Bitcoin Knots BLAKE2b',
    endpoints: {
      rpcHostId: b2bRpcHostId,
      rpcPort: b2bRpcPort,
    },
    healthChecks: blake2bHealthChecks,
  },
} as const

export type BackendId = keyof typeof backends
export const backendIds = Object.keys(backends) as BackendId[]
export const defaultBackend: BackendId = 'bitcoind'

/**
 * The minimum version of each backend this package will accept.
 *
 * `bitcoind` and the two mainnet forks are held at the revision that introduced
 * the bridge-resolvable RPC host, which is what `bitcoindRpcBridge` needs.
 * `knots-blake2b` has its own numbering and is held at its current release.
 */
export const versionRange: Record<BackendId, string> = {
  bitcoind:
    '(>=28.4:17 && <29) || (>=29.4:4 && <30) || (>=30.3:4 && <31) || >=31.1:4',
  'knots-prerdts': '>=29.3:25',
  'knots-blake2b': '>=1.0.0:17',
}
