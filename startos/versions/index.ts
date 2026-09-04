import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_3_3_1_16 } from './v3.3.1_16'
import { v_3_3_1_3 } from './v3.3.1_3'
import { v_3_3_1_31 } from './v3.3.1_31'
import { v_3_3_1_33 } from './v3.3.1_33'
import { v_3_3_1_34 } from './v3.3.1_34'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_3_3_1_3, v_3_3_1_16, v_3_3_1_31, v_3_3_1_33, v_3_3_1_34],
})
