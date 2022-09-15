/* global chrome */

;(function () {
  'use strict'

  var urlBase = 'https://api.spotify.com/v1/search?type=track&q='
  var trackApiUrl = 'https://www.shazam.com/discovery/v5/en/GB/web/-/track/'
  var apiVersion = '?shazamapiversion=v3'
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

  function getTrack() {
    url = location.href
    var trackId = /\d+/g.exec(location.href)[0]
    if (trackId.length) {
      fetch(trackApiUrl + trackId + apiVersion)
        .then((response) => response.json())
        .then(searchSpotify(data))
        .catch(() => {})
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
