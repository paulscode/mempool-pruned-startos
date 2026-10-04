import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

const notes = `Lightning Fork can be the explorer's Lightning node, the mining pages work on a pruned node, and on the BLAKE2b chain fiat values are BTCB2's own.

Enable Lightning offers Lightning Fork (BLAKE2b) beside LND and Core Lightning. The explorer reads Lightning Fork's network graph the way it reads LND's, using its read-only credentials. Lightning Fork runs on the BLAKE2b chain, so it cannot be chosen while the explorer follows the node on the SHA256 chain.

The Lightning pages also left out every channel on a pruned node. To date and size a channel, the explorer looked up the transaction that opened it, which only a node keeping a full transaction index can answer, and a pruned node cannot keep one. It now takes a channel's capacity from the Lightning node and its date from the block header, which a pruned node keeps for every block.

On a pruned node the mining pages stopped filling in. Indexing reached the first block below your node's prune height, asked the node for figures it can no longer compute for that block, failed, and started again every ten seconds, so hashrate, difficulty and pool statistics never ran either. Those figures now come from the block itself, fetched from peers as other old blocks already are, and match the node's own exactly with one exception: per-transaction fees would need every input's previous transaction, so an older block shows its average fee rate across its fee range instead of a spread. The catch-up runs once and takes a while. Each new block also no longer waits up to a minute while the explorer asks peers for stale blocks your node has pruned, which they do not serve.

On the BLAKE2b chain every fiat figure was the price of bitcoin on the SHA256 chain, about two hundred times too high. Prices now come from BTCB2's dollar market on neoxa.exchange, the same source as Lightning Fork and Sparrow BLAKE2b, with other currencies converted at Coingecko's rates. Past values use Neoxa's hourly prices since BTCB2 listed on 1 September 2026; transactions between the fork and the listing use its first traded price, and anything before the fork keeps bitcoin's price, which was the same coin then. On first start, prices recorded after the fork are replaced. On the SHA256 chain nothing about prices changes.

Nothing you have set changes and no reindex is needed.`

export const current = VersionInfo.of({
  version: '3.3.1:39',
  releaseNotes: {
    en_US: notes,
    es_ES: notes,
    de_DE: notes,
    pl_PL: notes,
    fr_FR: notes,
  },
  migrations: {
    // Nothing to migrate. An install that already uses LND has no
    // lightningPackage in its store, which reads as 'lnd', so it carries on
    // exactly as before. The backend changes are in the image: the price
    // cleanup on the BLAKE2b chain runs there, once, keyed on its own database
    // state.
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
