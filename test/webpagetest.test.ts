import { ux, sdk } from '@cto.ai/sdk'
import * as assert from 'assert'
import axios from 'axios'
import sinon from 'sinon'
import WebPageTest from 'webpagetest'
import {
  getTestLocations,
  filterConnection,
  createConnectivityObj,
  runWebPageTest,
} from '../src/utils/webpagetest'
import { WEBPAGETEST_INSTANCE } from '../src/constants'

suite('getTestLocations', () => {
  let axiosStub: sinon.SinonStub
  let trackStub: sinon.SinonStub
  let printStub: sinon.SinonStub
  let promptStub: sinon.SinonStub
  suiteSetup(() => {
    axiosStub = sinon.stub(axios, 'get')
    trackStub = sinon.stub(sdk, 'track')
    printStub = sinon.stub(ux, 'print')
    promptStub = sinon.stub(ux, 'prompt').returns(
      Promise.resolve({
        location: 'Dulles',
        browser: 'Chrome',
        connection: 'LTE',
      }),
    )
  })

  suiteTeardown(() => {
    axiosStub.restore()
    trackStub.restore()
    printStub.restore()
    promptStub.restore()
  })

  test('It should return connectivity object based on prompts', async () => {
    const stubbedData = {
      status: 200,
      statusText: 'OK',
      config: {
        method: 'GET',
        url: 'testurl',
      },
      data: {
        statusCode: 200,
        statusText: 'OK',
        data: {
          Dulles: {
            Browsers: 'Firefox',
          },
        },
      },
    }
    axiosStub.returns(Promise.resolve(stubbedData))
    const connectivity = await getTestLocations()

    assert.equal(connectivity.location, 'Dulles')
    assert.equal(connectivity.connectionProfile, 'LTE')
    assert.equal(connectivity.browser, 'Chrome')
  })

  test('It should throw Error if request is not successful', async () => {
    const stubbedData = {
      status: 500,
      statusText: 'notOK',
      config: {
        method: 'GET',
        url: 'testurl',
      },
      data: {
        statusCode: 500,
        statusText: 'NotOK',
        data: {
          Dulles: {
            Browsers: 'Firefox',
          },
        },
      },
    }
    axiosStub.returns(Promise.resolve(stubbedData))
    const expectedError = new Error(
      'GET request to testurl failed: Status 500 StatusText notOK',
    )
    await assert.rejects(getTestLocations, expectedError)
  })
})

suite('filterConnection', () => {
  test('It should return first element in > 1', () => {
    const connection_1 = filterConnection('foo-bar')
    assert.equal(connection_1, 'foo')
  })
  test('It should return only element in = 1', () => {
    const connection_2 = filterConnection('foo')
    assert.equal(connection_2, 'foo')
  })
  test('It should return nothing in < 1', () => {
    const connection_3 = filterConnection('')
    assert.equal(connection_3, '')
  })
})

suite('createConnectivityObj', () => {
  test('It should return correct obj', () => {
    const obj = createConnectivityObj('foo', 'bar', 'baz')
    const expectedObj = {
      location: 'foo',
      browser: 'bar',
      connectionProfile: 'baz',
    }
    assert.deepEqual(obj, expectedObj)
  })
})

suite('runWebPageTest', () => {
  let trackStub: sinon.SinonStub
  let printStub: sinon.SinonStub
  let promptStub: sinon.SinonStub

  suiteSetup(() => {
    trackStub = sinon.stub(sdk, 'track')
    printStub = sinon.stub(ux, 'print')
    promptStub = sinon.stub(ux, 'prompt')
  })

  suiteTeardown(() => {
    trackStub.restore()
    printStub.restore()
    promptStub.restore()
  })

  teardown(() => {
    trackStub.reset()
    printStub.reset()
    promptStub.reset()
  })

  test('It should print missing API key error on undefined args', async () => {
    await runWebPageTest(undefined)
    assert.ok(
      printStub.calledOnceWithExactly(
        `😅 Seems like you are missing API key for WebPageTest. Please visit \`https://www.webpagetest.org/getkey.php\` to create one.`,
      ),
    )
  })

  test('It should print error with failing init', async () => {
    await runWebPageTest('foo')
    assert.ok(
      printStub.calledOnceWith(
        `😅 Something went wrong with running WebPageTest. Check your logs for details.`,
      ),
    )
  })
})
