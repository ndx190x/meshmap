/*
 * @class EqurectangularTile
 * @author Yuta Tachibana
 *
 * for Google Maps API v3
 *
 * use google maps custom overlay
 * https://developers.google.com/maps/documentation/javascript/customoverlays
 *
 * fit equirectangular projection tiles to spherical mercator
 *
 * requirements:
 * 	leaflet.js v1.0
 * 	leaflet-equirectangular.js
 *
 */

EquirectangularTile.prototype = new google.maps.OverlayView();


/** @constructor */
function EquirectangularTile(url, options, map){
	this.map = map;
	this.div_ = null;
	this.opacity = 0.7;
	
	this.leaflet = new L.EquirectangularTileGoogle(url, options);

	this.setMap(map);
}


/** @public methods called by google maps */
EquirectangularTile.prototype.onAdd = function() {
	var div = document.createElement('div');
	L.DomUtil.setOpacity(div, this.opacity);
	this.div_ = div;

	this.leaflet.customOverlay(this.map, div, this.getProjection());
	this.leaflet.onAdd();

	// add layer to the overlayLayer pane
	var panes = this.getPanes();
	panes.overlayLayer.appendChild(div);

	// add bounds changed event listener
	var leaflet = this.leaflet,
		map = this.map;
	this.map.addListener("bounds_changed", function() {
		leaflet._update();
	});
	this.map.addListener("zoom_changed", function() {
		leaflet._setView(map.getCenter(), map.getZoom(), true);
	});
};

EquirectangularTile.prototype.draw = function() {
	this.leaflet._update();
};

EquirectangularTile.prototype.onRemove = function() {
	this.leaflet.onRemove();
	this.div_ = null;
	google.maps.event.clearInstanceListeners(this.map);
};


/** wrapper to L.EquirectangularTile */
L.EquirectangularTileGoogle = L.EquirectangularTile.extend({
	
	customOverlay: function (map, div, projection) {
		this._gmap = map; // google maps
		this._container = div;
 
		// dumy leaflet map object
		// wrapper to google maps
		this._map = {
			gmap: map,
			getZoom: this._getZoom,
			getCenter: this._getCenter,
			getBounds: this._getBounds,
			projection: projection,
			project: this._project
		};
	},
	
	onAdd: function () {
		this._initContainer();

		this._levels = {};
		this._tiles = {};
		this._resetView();
	},

	onRemove: function () {
		this._removeAllTiles();
		L.DomUtil.remove(this._container);
		this._container = null;
		this._tileZoom = null;
	},

	/**  wraper to google maps */
	_getZoom: function () {
		return this.gmap.getZoom();
	},

	_getCenter: function () {
		var center = this.gmap.getCenter();
		return L.latLng(center.lat(), center.lng());
	},

	_getBounds: function () {
		var bounds = this.gmap.getBounds(),
			sw = bounds.getSouthWest(),
			ne = bounds.getNorthEast();

		// google maps getBounds lng must be from -180 to 180
		var w = sw.lng(),
			e = (ne.lng() > 0) ? ne.lng() : 180 - ne.lng();

		return L.latLngBounds([
			[sw.lat(), w],
			[ne.lat(), e]
		]);
	},

	_project: function (latlng, zoom) {
		// convert to google maps latlng
		var l = L.latLng(latlng);
		var gLatLng = new google.maps.LatLng(l.lat, l.lng);
		var p = this.projection.fromLatLngToDivPixel(gLatLng);

		return new L.Point(p.x, p.y);
	},


	/**  override - disable level.origin */
	_updateLevels: function () {

		var zoom = this._tileZoom,
		    maxZoom = this.options.maxZoom;

		if (zoom === undefined) { return undefined; }

		for (var z in this._levels) {
			if (this._levels[z].el.children.length || z === zoom) {
				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
			} else {
				L.DomUtil.remove(this._levels[z].el);
				this._removeTilesAtZoom(z);
				delete this._levels[z];
			}
		}

		var level = this._levels[zoom],
		    map = this._map;

		if (!level) {
			level = this._levels[zoom] = {};

			level.el = L.DomUtil.create('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
			level.el.style.zIndex = maxZoom;

			// google maps LatLngToDivPixel id relative to map div
			// leaflet origin has no meanings
			level.origin = new L.Point(0, 0);
			level.zoom = zoom;

			//this._setZoomTransform(level, map.getCenter(), map.getZoom());

			// force the browser to consider the newly added element for transition
			L.Util.falseFn(level.el.offsetWidth);
		}

		this._level = level;

		return level;
	},
	
	// zoom transform for each tiles
	_setZoomTransforms: function (center, zoom) {
		for (var t in this._tiles) {
			var tile = this._tiles[t];

			if (Math.abs(tile.coords.z - zoom) <= 1){
				var pos = this._getTilePos(tile.coords);
				var tileSize = this._getTileSizeCoords(tile.coords);
				
				tile.el.style.width = tileSize.x + 'px';
				tile.el.style.height = tileSize.y + 'px';
				L.DomUtil.setPosition(tile.el, pos);
			}
		}
	},
	
	
});


