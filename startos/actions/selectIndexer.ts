import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedIndexer } from '../utils'
const { InputSpec, Value } = sdk

const indexerInputSpec = InputSpec.of({
  indexer: Value.select({
    name: i18n('Select Indexer'),
    // Upstream's option list, but not upstream's cost for None. Upstream
    // requires an archival node with txindex, so None there only loses address
    // lookups. Here the node may be pruned, and BACKEND 'none' sends confirmed
    // transaction lookups back to Bitcoin RPC, which is the exact call this
    // package exists to avoid.
    description: i18n(
      '- Fulcrum: Fulcrum on this server answers address lookups. It needs an archival node.\n- Electrs: Electrs on this server answers address lookups. It needs an archival node.\n- Electrs Pruned: Electrs Pruned on this server answers address lookups. It works with a pruned node: it can index blocks your node has already discarded.\n- Fulcrum Pruned: Fulcrum Pruned on this server answers address lookups. It works with a pruned node in the same way.\n- None: address search is turned off. Against a pruned node, transaction pages break too: confirmed transactions are then looked up over Bitcoin RPC, which a pruned node cannot answer.\nThe indexer you choose must be installed and running on this server.',
    ),
    // Upstream marks Fulcrum "recommended". That advice assumes the archival
    // node upstream requires; here the node may be pruned, where Fulcrum and
    // Electrs cannot work at all, so no option is recommended over the others
    // and the description says which ones a pruned node needs.
    values: {
      fulcrum: i18n('Fulcrum'),
      electrs: i18n('Electrs'),
      'electrs-pruned': i18n('Electrs Pruned (works with a pruned node)'),
      'fulcrum-pruned': i18n('Fulcrum Pruned (works with a pruned node)'),
      none: i18n('None — address lookups disabled'),
    },
    // Nothing preselected, so closing the form without choosing does not read
    // as a choice already made.
    default: null,
  }),
})

export const selectIndexer = sdk.Action.withInput(
  'select-indexer',

  {
    name: i18n('Select Indexer'),
    description: i18n(
      'Choose the Electrum server Mempool uses to look up addresses, or turn address lookups off.',
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
