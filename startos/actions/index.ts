import { sdk } from '../sdk'
import { selectBackend } from './selectBackend'
import { selectIndexer } from './selectIndexer'
import { enableLightning } from './enableLightning'
import { indexingAndPerformance } from './indexingAndPerformance'
import { clearBackendCache } from './clearBackendCache'
import { torProxy } from './torProxy'

export const actions = sdk.Actions.of()
  .addAction(selectBackend)
  .addAction(selectIndexer)
  .addAction(enableLightning)
  .addAction(indexingAndPerformance)
  .addAction(torProxy)
  .addAction(clearBackendCache)
