import { ux, sdk } from '@cto.ai/sdk'
import { track } from './utils/track'
import { runWebPageTest } from './utils/webpagetest'
import { getLogo } from './constants'

const { callOutCyan } = ux.colors

const main = async () => {
  const logo = getLogo();
  await ux.print(logo);
  await ux.print(
    `🚀 ${callOutCyan("Welcome to CTO.ai's Website Performance Op!")}`,
  )
  await ux.print(
    `${callOutCyan("This Op will allow you to test website's performance!")}`,
  )
  await track('Started running CTO.ai Performance op')
  const { WEBPAGETEST_APIKEY } = await sdk.getSecret('WEBPAGETEST_APIKEY')
  await runWebPageTest(WEBPAGETEST_APIKEY)
}
main()
