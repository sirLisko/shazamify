/* global chrome */

;(function () {
  'use strict'

  var urlBase = 'https://api.spotify.com/v1/search?type=track&q='
  var trackApiUrl = 'https://www.shazam.com/discovery/v1/en/GB/web/-/track/'
  var url

  function handleResponse({ tracks: { items } = {} }) {
    if (items && items.length) {
      var button = document.createElement('a')
      button.id = 'shazamify'
      button.href = items[0].uri
      setTimeout(function () {
        Array.from(document.querySelectorAll('.parts')).map((elem) =>
          elem.appendChild(button)
        )
      }, 1000)
    }
  }

  function searchSpotify(track) {
    chrome.runtime.sendMessage(getUrl(track), (result) => {
      handleResponse(result)
    })
  }

  function getUrl(track) {
    var query = track.title + ' artist:' + track.subtitle
    return urlBase + encodeURIComponent(query)
  }

  function waitForNewTrack() {
    var waitTrack = setInterval(function () {
      if (url !== location.href) {
        clearInterval(waitTrack)
        getTrack()
      }
    }, 1000)
  }

  function getTrackInfo(e) {
    var data = e.target
    if (data.status >= 200 && data.status < 400) {
      data = JSON.parse(data.responseText)
      searchSpotify(data.heading)
    }
  }

  function getTrack() {
    url = location.href
    var trackId = /\d+/g.exec(location.href)[0]
    if (trackId.length) {
      var request = new XMLHttpRequest()
      request.open('GET', trackApiUrl + trackId, true)
      request.onload = getTrackInfo
      request.send()
    }
  }

  function attachEvents() {
    document.addEventListener(
      'click',
      function (e) {
        e.target.getAttribute('href') &&
          e.target.getAttribute('href').indexOf('www.shazam.com/track') !==
            -1 &&
          waitForNewTrack()
      },
      false
    )
  }

  attachEvents()
  getTrack()
})()
