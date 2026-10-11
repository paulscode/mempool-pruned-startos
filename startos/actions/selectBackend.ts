import { backends, defaultBackend } from '../backends'
import { configJson } from '../fileModels/mempool-config.json'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

/**
 * Which bitcoind flavor this Mempool runs against.
 *
 * `dependencies.ts` declares each as an optional dependency and enables exactly
 * one, so the UI shows a single node dependency and does not nag about the
 * flavors the user is not running.
 */
const backendInputSpec = InputSpec.of({
  backend: Value.select({
    name: i18n('Select Node'),
    description: i18n(
      'Which Bitcoin service this explorer reads blocks and transactions from.',
    ),
    values: Object.fromEntries(
      Object.entries(backends).map(([id, b]) => [id, b.title]),
    ) as Record<string, string>,
    default: defaultBackend,
  }),
})

export const selectBackend = sdk.Action.withInput(
  'select-backend',

  {
    name: i18n('Select Node'),
    description: i18n('Choose which Bitcoin service backs this explorer'),
    warning: i18n(
      'Switching nodes points the explorer at a different chain. Its database is built against the chain it was indexing, so clear the backend cache after switching.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  backendInputSpec,

  async ({ effects }) => ({
    backend: ((await storeJson.read((s) => s?.backend).const(effects)) ??
      defaultBackend) as any,
  }),

  // Recorded as intent. The address it resolves to is read from the selected
  // package's bridge at start, by bitcoindRpcBridge, so nothing here writes an
  // address that could go stale.
  async ({ effects, input }) => {
    // The reverse of the check in Enable Lightning: Lightning Fork's channels
    // are funded on the BLAKE2b chain, which the SHA256 Companion does not
    // follow.
    if (input.backend === 'knots-prerdts') {
      const lightning = await configJson.read((c) => c.LIGHTNING).once()
      const lndPackage = await storeJson.read((s) => s?.lightningPackage).once()
      if (
        lightning?.ENABLED &&
        lightning.BACKEND === 'lnd' &&
        lndPackage === 'lightning-fork'
      ) {
        throw new Error(
          i18n(
            "Lightning Fork, this explorer's Lightning node, follows the Bitcoin BLAKE2b chain, and the SHA256 Companion reads the SHA256 chain. Choose another Lightning node, or None, under Enable Lightning first.",
          ),
        )
      }
    }
    await storeJson.merge(effects, { backend: input.backend as any })
  },
)
