import { configJson } from '../fileModels/mempool-config.json'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { clnMountpoint, isLowRam, lndCertPath, lndMacaroonPath } from '../utils'
import { i18n } from '../i18n'
const { InputSpec, Value } = sdk

const lowRamWarning = isLowRam()
  ? i18n(
      'Lightning network data is memory-intensive and is recommended only on devices with 16 GB of RAM or more. Running it alongside Bitcoin and an Electrum indexer on a smaller device can trigger out-of-memory crashes that take down Mempool or one of its dependencies.',
    )
  : null

export const lightningInputSpec = InputSpec.of({
  lightning: Value.select({
    name: i18n('Lightning Node'),
    description: i18n(
      '- LND: the Lightning tab shows network data from LND on this server.\n- Lightning Fork (BLAKE2b): the Lightning tab shows network data from Lightning Fork on this server. It follows the BLAKE2b chain, and cannot be chosen while the explorer reads the SHA256 chain through the SHA256 Companion.\n- Core Lightning: the Lightning tab shows network data from Core Lightning on this server.\n- None: the Lightning tab is hidden.',
    ),
    default: 'none',
    values: {
      lnd: i18n('LND'),
      'lightning-fork': i18n('Lightning Fork (BLAKE2b)'),
      cln: i18n('Core Lightning'),
      none: i18n('None'),
    },
  }),
})

export const matchLightningInputSpec = lightningInputSpec.validator
export type LightningInputSpec = typeof lightningInputSpec._TYPE

export const enableLightning = sdk.Action.withInput(
  'enable-lightning',

  {
    name: i18n('Enable Lightning'),
    description: i18n(
      'Use this setting to select the Lightning node used to serve network data to the Lightning tab in Mempool',
    ),
    warning: lowRamWarning,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  // form input specification
  lightningInputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const config = await configJson.read().const(effects)
    if (!config) throw new Error('Config file not found')
    const lndPackage = await storeJson
      .read((s) => s?.lightningPackage)
      .const(effects)

    const lightning: LightningInputSpec['lightning'] = !config.LIGHTNING.ENABLED
      ? 'none'
      : config.LIGHTNING.BACKEND === 'lnd' && lndPackage === 'lightning-fork'
        ? 'lightning-fork'
        : config.LIGHTNING.BACKEND
    return { lightning }
  },

  // the execution function
  async ({ effects, input }) => {
    switch (input.lightning) {
      case 'lnd':
      case 'lightning-fork': {
        // Lightning Fork's graph is the Bitcoin BLAKE2b chain's: its channels
        // are funded there, so an explorer reading the SHA256 chain would show
        // them against transactions it does not have.
        const backend = await storeJson.read((s) => s?.backend).once()
        if (
          input.lightning === 'lightning-fork' &&
          backend === 'knots-prerdts'
        ) {
          throw new Error(
            i18n(
              'Lightning Fork follows the Bitcoin BLAKE2b chain, and this explorer reads the SHA256 chain through the SHA256 Companion. Choose a node on the BLAKE2b chain under Select Node first.',
            ),
          )
        }
        await storeJson.merge(effects, { lightningPackage: input.lightning })
        await configJson.merge(effects, {
          LIGHTNING: { ENABLED: true, BACKEND: 'lnd' },
          LND: {
            TLS_CERT_PATH: lndCertPath,
            MACAROON_PATH: lndMacaroonPath,
          },
        })
        break
      }
      case 'cln':
        await configJson.merge(effects, {
          LIGHTNING: { ENABLED: true, BACKEND: 'cln' },
          CLIGHTNING: { SOCKET: `${clnMountpoint}/lightning-rpc` },
        })
        break
      default:
        await configJson.merge(effects, {
          LIGHTNING: { ENABLED: false },
        })
        break
    }
  },
)
