import { selectIndexer } from '../actions/selectIndexer'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { selectedIndexer } from '../utils'

// Raised whenever the choice is unmade, not only on install: an install that
// updated into this feature was never asked, and gating on `kind === 'install'`
// left it that way forever. Declining counts as made — `'none'` is a value.
export const taskSelectIndexer = sdk.setupOnInit(async (effects) => {
  if (await selectedIndexer(effects)) return
  await sdk.action.createOwnTask(effects, selectIndexer, 'critical', {
    reason: i18n('Select which Electrum server to use for address lookups'),
  })
})
