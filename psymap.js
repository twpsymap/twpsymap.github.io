var map;
var markers = [];

function initmap() {
	map = new L.Map('map');

	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 18, attribution: osmAttrib});
	var taipeiLatLng = new L.LatLng(25.045, 121.53828);
	var defaultZoom = 13;

	map.setView(taipeiLatLng, defaultZoom);
	map.addLayer(osm);

	// load most markers in taipei at first
	plotNodes(121.2938690185547, 24.935946005354886, 121.7827606201172, 25.153675575823335);

	map.on('moveend', function () {
		plotNodes(
			map.getBounds().getSouthWest().lng,
			map.getBounds().getSouthWest().lat,
			map.getBounds().getNorthEast().lng,
			map.getBounds().getNorthEast().lat
		);
	});
}

function addMark(lat, lng, data) {
	if (!markers.includes(data.address)) {
		var marker = new L.Marker(new L.LatLng(lat, lng));
		var popupContent = data.name + '<br>' +
			data.address + '<br>' +
			data.phone + '<br>' +
			'<a href="' + data.website + '" target="_blank">' + data.website + '</a>';
		marker.bindPopup(popupContent).openPopup();

		marker.on('click', function() {
			var info = document.getElementById('info');
			info.innerHTML = popupContent;
		});

		map.addLayer(marker);
		markers.push(data.address);
	}
}

function plotNodes(left, bottom, right, top) {
	var apiUrl = 'http://www.overpass-api.de/api/xapi?';

	$.ajax({
		url: apiUrl + 'node[bbox=' + left + ',' + bottom + ',' + right + ',' + top + '][healthcare=psychotherapist]',
		dataType: 'xml',
		success: function(response) {
			var $xml = $(response);
			var nodes = $xml.find('node');

			for (var i = 0; i < nodes.length; i++) {
				$node = $(nodes[i]);
				tags = $node.find('tag');

				for (var j = 0; j < tags.length; j++) {
					$tag = $(tags[j]);

					switch ($tag.attr('k')) {
						case 'name':
							var name = $tag.attr('v');
							break;
						case 'addr:full':
							var address = $tag.attr('v');
							break;
						case 'phone':
							var phone = $tag.attr('v');
							break;
						case 'website':
							var website = $tag.attr('v');
							break;
						case 'email':
							var email = $tag.attr('v');
							break;
					}
				}

				addMark(
					$node.attr('lat'),
					$node.attr('lon'),
					{name: name, address: address, phone: phone, website: website, email: email}
				);
			}
		}
	});

	$.ajax({
		url: apiUrl + 'way[bbox=' + left + ',' + bottom + ',' + right + ',' + top + '][healthcare=psychotherapist]',
		dataType: 'xml',
		success: function(response) {
			var $xml = $(response);
			var nodes = $xml.find('node');
			var ways = $xml.find('way');

			for (var i = 0; i < ways.length; i++) {
				$way = $(ways[i]);
				tags = $way.find('tag');

				for (var j = 0; j < tags.length; j++) {
					$tag = $(tags[j]);

					switch ($tag.attr('k')) {
						case 'name':
							var name = $tag.attr('v');
							break;
						case 'addr:full':
							var address = $tag.attr('v');
							break;
						case 'phone':
							var phone = $tag.attr('v');
							break;
						case 'website':
							var website = $tag.attr('v');
							break;
						case 'email':
							var email = $tag.attr('v');
							break;
					}
				}

				var ndList = $way.find('nd');
				var $nd = $(ndList[0]);

				for (var j = 0; j < nodes.length; j++) {
					var $node = $(nodes[j]);

					if ($node.attr('id') == $nd.attr('ref')) {
						var lat = $node.attr('lat');
						var lon = $node.attr('lon');
						break;
					}
				}

				addMark(lat, lon,
					{name: name, address: address, phone: phone, website: website, email: email}
				);
			}
		}
	});
}