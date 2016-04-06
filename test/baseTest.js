/* global sinon */

(function(){
	'use strict';

	function createDOM(){
		var fakeDOM = document.createElement('div');
		fakeDOM.className = 'fakeDOM';
		fakeDOM.innerHTML =
			'<div class="tr-details">' +
				'<h1 class="trd-title">foo</h1>' +
				'<h2 class="trd-artist">bar</h2>' +
			'</div>' +
			'<div class="ctrl-bar"><div>';

		document.body.appendChild(fakeDOM);
	}

	function loadExtension(callback){
		var resource = document.createElement('script');
		resource.src = 'base/chrome-extension/base.js';
		resource.onload = callback;
		var script = document.getElementsByTagName('script')[0];
		script.parentNode.insertBefore(resource, script);
	}

	var server;

	module( 'shazamify', {
	  setup: function() {
	    server = sinon.fakeServer.create();
		createDOM();
	  },
	  teardown: function() {
	    server.restore();
	    document.body.removeChild(document.querySelector('.fakeDOM'));
	  }
	});

	asyncTest('Check that the correct track info are passed to the Spotify API', 1, function() {
		loadExtension(function(){
			start();
			ok(server.requests[0].url.indexOf('foo%20bar'), 'right query string appended');
		});
	});

	asyncTest('Spotify API returns no tracks', 1, function() {
		loadExtension(function(){
			start();

			server.requests[0].respond(
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify({ tracks: [] })
			);

			ok(!document.querySelectorAll('#shazamify').length, 'shazamify trigger has not been created!');
		});
	});

	asyncTest('Spotify API returns tracks', 2, function() {
		loadExtension(function(){
			start();

			server.requests[0].respond(
				200,
				{ 'Content-Type': 'application/json' },
				JSON.stringify({ tracks: {
					items: [{
						href: 'bar'
					}]
				}})
			);

			var shazamify = document.querySelectorAll('#shazamify');
			ok(shazamify.length, 'shazamify trigger has been created!');
			ok(shazamify[0].href, 'bar', 'with the correct href');
		});
	});
})();
