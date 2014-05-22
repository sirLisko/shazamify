(function(){
	'use strict';

	var urlBase = 'http://ws.spotify.com/search/1/track.json?q=', url;

	function handleResponse(data){
		if(data.tracks.length) {
			var button = document.createElement('a');
			button.id = 'shazamify';
			button.href = data.tracks[0].href;

			document.querySelector('.tr-buttons').appendChild(button);
		}
	}

	function apiOnLoad(e){
		var data = e.target;
		if (data.status >= 200 && data.status < 400){
			data = JSON.parse(data.response);
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
		return urlBase + encodeURIComponent(document.querySelector('.tr-details').innerText);
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
		var tracks = document.querySelectorAll('[data-track-id] [href*="discover/track"]');
		Array.prototype.forEach.call(tracks, function(track){
			track.addEventListener('click', waitForNewTrack, false);
		});
	}

	attachEvents();
	fetchSpotify();

})();
