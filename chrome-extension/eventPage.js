/* eslint camelcase: "off" */
/* global chrome */

const client_id = '56c47c9077c14096a0e81e91b5237318'
const redirect_uri = chrome.identity.getRedirectURL('oauth2')

const buildQueryString = (params) =>
  Object.keys(params)
    .map((key) => [key, params[key]].map(encodeURIComponent).join('='))
    .join('&')
    .replace(/%20/g, '+')

const randomState = () => {
  let array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return String(array[0])
}

const authorize = () =>
  new Promise((resolve, reject) => {
    const state = randomState()
    chrome.identity.launchWebAuthFlow(
      {
        url:
          'https://accounts.spotify.com/authorize?' +
          buildQueryString({
            client_id,
            redirect_uri,
            response_type: 'token',
            state,
          }),
        interactive: true,
      },
      (redirectURL) => {
        if (!redirectURL) {
          console.error(chrome.runtime.lastError.message)
          console.error('RedirectUrl wrong!')
        } else {
          const params = new URLSearchParams(redirectURL.split('#')[1])
          if (params.get('state') !== state) {
            throw new Error('Invalid state')
          }
          const accessToken = params.get('access_token')
          chrome.storage.local.set({ accessToken }, () => {
            resolve(accessToken)
          })
        }
      }
    )
  })

const getToken = () =>
  new Promise((resolve, reject) => {
    chrome.storage.local.get('accessToken', ({ accessToken }) => {
      resolve(accessToken || authorize())
    })
  })

const searchTrack = async (url, sendResponse) => {
  const accessToken = await getToken()
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  }
  const response = await fetch(url, { headers })
  const data = await response.json()
  if (data.error) {
    console.error(data.error)
    if (data.error.status === 400 || data.error.status === 401) {
      authorize()
    }
    return
  }
  return sendResponse(data)
}

chrome.runtime.onMessage.addListener((track, sender, sendResponse) => {
  searchTrack(track, sendResponse)
  return true
})
