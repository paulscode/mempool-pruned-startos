import { storeJson } from '../file-models/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedIndexer } from '../utils'
const { InputSpec, Value } = sdk

const indexerInputSpec = InputSpec.of({
  indexer: Value.select({
    name: i18n('Select Indexer'),
    // Upstream's option set, but not upstream's cost. Upstream requires an
    // archival node with txindex, so None there only loses address lookups.
    // Here the node may be pruned, and BACKEND 'none' sends confirmed
    // transaction lookups back to Bitcoin RPC, which is the exact call this
    // package exists to avoid.
    description: i18n(
      'Select an Electrum server to use for address lookups. Against a pruned node this is not optional in practice: with None, confirmed transactions are looked up over Bitcoin RPC, which a pruned node cannot answer.',
    ),
    values: {
      fulcrum: i18n('Fulcrum (recommended)'),
      electrs: i18n('Electrs'),
      'electrs-pruned': i18n('Electrs Pruned (works with a pruned node)'),
      none: i18n('None — address lookups disabled'),
    },
    // Nothing preselected, so closing the form without choosing does not read
    // as a choice already made. The spec accepts null; only the SDK 2.0.9
    // builder signature does not.
    default: null as any,
  }),
})

export const selectIndexer = sdk.Action.withInput(
  'select-indexer',

  {
    name: i18n('Select Indexer'),
    description: i18n(
      'Enables address lookups via an internal indexer instance',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  // form input specification
  indexerInputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => ({ indexer: await selectedIndexer(effects) }),

  // the execution function. Record the choice in StartOS state; init/watchHosts
  // resolves the indexer's LXC-bridge address into ELECTRUM.HOST/PORT next start.
  async ({ effects, input }) =>
    storeJson.merge(effects, { indexer: input.indexer }),
)
