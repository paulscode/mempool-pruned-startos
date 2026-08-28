import { backends, defaultBackend } from '../backends'
import { storeJson } from '../file-models/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

/**
 * Which bitcoind flavor this Mempool runs against.
 *
 * The manifest declares all four as optional dependencies and `dependencies.ts`
 * returns exactly one as required, so the UI shows a single node dependency and
 * does not nag about the flavors the user is not running.
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
  async ({ effects, input }) =>
    storeJson.merge(effects, { backend: input.backend as any }),
)
