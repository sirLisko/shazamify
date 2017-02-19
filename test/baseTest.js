/* global sinon */

(function () {
  'use strict'

  function createDOM () {
    var fakeDOM = document.createElement('div')
    fakeDOM.className = 'fakeDOM'
    fakeDOM.innerHTML = '<div class="parts"><div>'

    document.body.appendChild(fakeDOM)
  }

  function loadExtension (callback) {
    var resource = document.createElement('script')
    resource.src = 'base/chrome-extension/base.js'
    resource.onload = callback
    var script = document.getElementsByTagName('script')[0]
    script.parentNode.insertBefore(resource, script)
  }

  var clock
  var server

  module('shazamify', {
    setup: function () {
      clock = sinon.useFakeTimers()
      server = sinon.fakeServer.create()

      createDOM()
    },
    teardown: function () {
      clock.restore()
      server.restore()
      document.body.removeChild(document.querySelector('.fakeDOM'))
    }
  })

  asyncTest('Check that the correct track info are passed to the Spotify API', 1, function () {
    loadExtension(function () {
      start()
      ok(server.requests[0].url.indexOf('foo%20bar'), 'right query string appended')
    })
  })

  asyncTest('Spotify API returns no tracks', 1, function () {
    loadExtension(function () {
      start()

      server.requests[0].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ heading: {title: 'foo'} })
      )

      server.requests[1].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ tracks: [] })
      )

      clock.tick(1001)

      ok(!document.querySelectorAll('#shazamify').length, 'shazamify trigger has not been created!')
    })
  })

  asyncTest('Spotify API returns tracks', 2, function () {
    loadExtension(function () {
      start()

      server.requests[0].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ heading: {title: 'foo'} })
      )

      server.requests[1].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ tracks: {
          items: [{
            uri: 'bar'
          }]
        }})
      )

      clock.tick(1001)

      var shazamify = document.querySelectorAll('#shazamify')
      ok(shazamify.length, 'shazamify trigger has been created!')
      ok(shazamify[0].href, 'bar', 'with the correct href')
    })
  })
})()
