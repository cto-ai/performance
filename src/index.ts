import { ux, sdk } from '@cto.ai/sdk'
import { track } from './utils/track'
import { runWebPageTest } from './utils/webpagetest'

const { callOutCyan } = ux.colors

const main = async () => {
  await ux.print(
    `🚀 ${callOutCyan("Welcome to CTO.ai's Website Performance Op!")}`,
  )
  await track('Started running CTO.ai Measure op')
  const { WEBPAGETEST_APIKEY } = await sdk.getSecret('WEBPAGETEST_APIKEY')
  await runWebPageTest(WEBPAGETEST_APIKEY)
}
main()
