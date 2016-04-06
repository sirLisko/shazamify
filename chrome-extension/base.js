(function(){
	'use strict';

	var urlBase = 'https://api.spotify.com/v1/search?type=track&q=', url;

	function handleResponse(data){
		if(data && data.tracks && data.tracks.items && data.tracks.items.length) {
			var button = document.createElement('a');
			button.id = 'shazamify';
			button.href = data.tracks.items[0].href;

			document.querySelector('.ctrl-bar > div').appendChild(button);
		}
	}

	function apiOnLoad(e){
		var data = e.target;
		if (data.status >= 200 && data.status < 400){
			data = JSON.parse(data.responseText);
			handleResponse(data);
		}
	}

	function searchSpotify(url){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = apiOnLoad;
		request.send();
	}

	function getUrl(){
		var track = document.querySelector('.trd-title').textContent +
			' artist:' + document.querySelector('.trd-artist').textContent;
		return urlBase + encodeURIComponent(track);
	}

	function waitForNewTrack(){
		var waitTrack = setInterval(function(){
			if(url !== getUrl()){
				clearInterval(waitTrack);
				fetchSpotify();
			}
		}, 100);
	}

	function fetchSpotify(){
		url = getUrl();
		searchSpotify(url);
	}

	function attachEvents() {
		var tracks = document.querySelectorAll('[data-track-id] [href*="track"]');
		Array.prototype.forEach.call(tracks, function(track){
			track.addEventListener('click', waitForNewTrack, false);
		});
	}

	attachEvents();
	fetchSpotify();

})();
