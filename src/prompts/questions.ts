import { Questions } from '@cto.ai/sdk'

export const getGithubAccessToken: Questions<{
  accessToken: string
}> = {
  type: 'secret',
  name: 'accessToken',
  message: 'Please enter your Github access token',
}

export const getWebsite: Questions<{ websiteURL: string }> = {
  type: 'input',
  name: 'websiteURL',
  message: 'Please enter your website url',
}

export const getLocationFn = (
  locationList: string[],
): Questions<{ location: string }> => {
  const getLocation: Questions<{ location: string }> = {
    type: 'autocomplete',
    name: 'location',
    choices: locationList,
    message: 'Please select a location to test from',
  }
  return getLocation
}

export const getBrowserFn = (
  browserList: string[],
): Questions<{ location: string }> => {
  const getBrowser: Questions<{ browser: string }> = {
    type: 'list',
    name: 'browser',
    choices: browserList,
    message:
      'Please select a browser to test from\n (You can view lighthouse report if you choose Chrome)',
  }
  return getBrowser
}

export const getConnectionFn = (
  connectionList: string[],
): Questions<{ connection: string }> => {
  const getConnection: Questions<{ connection: string }> = {
    type: 'list',
    name: 'connection',
    choices: connectionList,
    message: 'Please select a connection to test with',
  }
  return getConnection
}
