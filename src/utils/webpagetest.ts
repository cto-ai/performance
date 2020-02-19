import { ux } from '@cto.ai/sdk'
import axios from 'axios'
import * as util from 'util'
import WebPageTest from 'webpagetest'
import {
  CONNECTION_LIST,
  WEBPAGETEST_INSTANCE,
  WEBPAGETEST_LH_URL,
  WEBPAGETEST_LOCATION,
} from '../constants'
import {
  getBrowserFn,
  getConnectionFn,
  getLocationFn,
  getWebsite,
} from '../prompts/questions'
import { Connectivity } from '../types/webpagetest'
import { track } from './track'

const { callOutCyan } = ux.colors

export const getTestLocations = async (): Promise<Connectivity> => {
  const locationJSON = await axios.get(WEBPAGETEST_LOCATION)
  if (locationJSON?.status !== 200 || locationJSON?.statusText !== 'OK') {
    await ux.print(
      `Fetching data for WebPageTest location went wrong: Status code ${locationJSON?.status} ${locationJSON?.statusText}`,
    )
    const ERROR_MSG = `${locationJSON?.config?.method} request to ${locationJSON?.config?.url} failed: Status ${locationJSON?.status} StatusText ${locationJSON?.statusText}`
    await track(new Error(ERROR_MSG))
    throw new Error(ERROR_MSG)
  }
  const locationList = Object.keys(locationJSON.data.data)
    .filter(el => {
      return el.includes('Dulles') || el.includes('ec2') //API KEY only supports following location
    })
    .sort()
  const { location } = await ux.prompt(getLocationFn(locationList))
  await track(`Selected test location: ${location}`)
  // This removes duplicates
  const browserSet: Set<string> = new Set(
    locationJSON?.data?.data?.[location]?.Browsers.split(',').sort(),
  )
  const browserList: string[] = Array.from(browserSet)
  const { browser } = await ux.prompt(getBrowserFn(browserList))
  await track(`Selected test browser: ${browser}`)
  const { connection } = await ux.prompt(getConnectionFn(CONNECTION_LIST))
  const connectionProfile = filterConnection(connection)
  await track(`Selected test connection profile: ${connectionProfile}`)
  const connectivity = createConnectivityObj(
    location.trim(),
    browser.trim(),
    connectionProfile.trim(),
  )
  return connectivity
}

export const filterConnection = (connectionString: string): string => {
  const connection = connectionString
    .split('-')
    .slice(0, 1)
    .join()
    .trim()
  return connection
}

export const createConnectivityObj = (
  location: string,
  browser: string,
  connectionProfile: string,
): Connectivity => {
  const connectivityObj: Connectivity = {
    location,
    browser,
    connectionProfile,
  }
  return connectivityObj
}

export const runWebPageTest = async (
  apikey: string | undefined,
): Promise<void> => {
  if (!apikey) {
    await ux.print(
      `😅 Seems like you are missing API key for WebPageTest. Please visit \`https://www.webpagetest.org/getkey.php\` to create one.`,
    )
    await track(new Error('API_KEY not found'))
    return
  }
  try {
    const wpt = new WebPageTest(WEBPAGETEST_INSTANCE, apikey)
    const connectivity = await getTestLocations()

    const config = {
      location: `${connectivity.location}:${connectivity.browser}.${connectivity.connectionProfile}`,
      firstViewOnly: false,
      runs: 1,
      video: true,
      pollResults: 5,
      lighthouse: 1,
    }
    const { websiteURL } = await ux.prompt(getWebsite)

    // Promisify runTest() using anonymous function
    const runTest = util.promisify(
      (url: string, config: Object, cb: Function) =>
        wpt.runTest(url, config, (err, result) => cb(err, result)),
    )

    await ux.print(
      `🏗  ${callOutCyan(
        `Running Web page performance test for ${websiteURL}...`,
      )}`,
    )
    // testReceipt is default to unknown type so forcing it to any
    const testReceipt: any = await runTest(websiteURL, config)
    const testId = testReceipt.data.id
    const getTestResults = util.promisify((testId: string, cb: Function) =>
      wpt.getTestResults(testId, (err, result) => cb(err, result)),
    )

    await ux.print(
      `🎉 ${callOutCyan(
        `Web page performance test for ${websiteURL} Successful! Printing results...`,
      )}`,
    )
    const testResult: any = await getTestResults(testId)
    const {
      loadTime,
      TTFB,
      SpeedIndex,
      domElements,
      docTime,
      requestsDoc,
      bytesInDoc,
      fullyLoaded,
      requestsFull,
      bytesIn,
    } = testResult.data.average.firstView
    await ux.print(
      `\`\`\`
    Load time: ${loadTime}ms
    Start render: ${TTFB}ms
    Speed Index: ${SpeedIndex}ms
    DOM elements: ${domElements}ms
    (Doc complete) Time: ${docTime}ms
    (Doc complete) Requests: ${requestsDoc}
    (Doc complete) Bytes in: ${bytesInDoc / 1000}KB
    (Fully loaded) Time: ${fullyLoaded}ms
    (Fully loaded) Requests: ${requestsFull}
    (Fully loaded) Bytes in: ${bytesIn / 1000}KB
    Waterfall View: ${testResult.data.runs[1].firstView.images.waterfall}
    \`\`\``,
    )

    if (connectivity.browser.toLowerCase().includes('chrome')) {
      const lhResult = testResult.data.lighthouse.categories
      const performance = lhResult.performance.score * 100
      const accessibility = lhResult.accessibility.score * 100
      const bestPractices = lhResult['best-practices'].score * 100
      const seo = lhResult.seo.score * 100
      const pwa = lhResult.pwa.score * 100
      const reportURL = WEBPAGETEST_LH_URL + testId
      await track(`Performed website audit for ${websiteURL}`)
      await ux.print(`🎉 The scores for ${websiteURL}`)
      await ux.print(`
      \`\`\`
      Performance Score: ${performance}
      Accessibility Score: ${accessibility}
      Best Practices Score: ${bestPractices}
      SEO Score: ${seo}
      PWA Score: ${pwa || 'Not available'}
      \`\`\`
      `)
      await ux.print(
        `🚀 View full audit report here: ${callOutCyan(reportURL)}`,
      )
    }
    return
  } catch (err) {
    await ux.print(
      `😅 Something went wrong with running WebPageTest. Check your logs for details.`,
    )
    if (err.statusCode && err.statusText) {
      await ux.print(
        `🤔 Seems like the location you chose is not available at the moment. Try a different location`,
      )
      const apiError = new Error(`${err.statusCode}: ${err.statusText}`)
      await track(apiError)
      return
    }
    if (JSON.stringify(err).includes('TIMEOUT')) {
      await ux.print(
        `🤦‍♂️ Seems like running test timed out (120s) Try different location or try again`,
      )
    }
    await track(new Error(JSON.stringify(err)))
  }
  return
}
