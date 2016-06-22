/*
 * @class L.equrectangularTile
 * @inherits TileLayer
 * @author Yuta Tachibana
 *
 * for leaflet v1.0.0-rc1
 *
 * fit equirectangular projection tiles to web mercator (spherical mercator)
 *
 */

L.EquirectangularTile = L.TileLayer.extend({


	options: {
		bounds: [[48.0, 118.0], [20.0, 150.0]],
		tileZoom: function (mqpZoom) {  // TODO: fractal zoom, auto fit?
			if (mapZoom <= 4){
				return 1;
			}else if (mapZoom >= 6){
				return 3;
			}else{
				return 2;
			}
		},
	},

	initialize: function (options) {
		options = L.setOptions(this, options);
	},

	createTile: function (coord, done) {

	},

	// !! 
	getTileSize: function (coords) {
		// tile latlonbounds -> point bounds -> height, width
	},


	// override GridLayer Methods
	//
	//
	// _tileCoordsToBounds, _keyToBounds, _globalTileRange are invalid in this class

	// map latlonbounds -> coords bounds
	_pxBoundsToTileRange: function (bounds) {	
		var mapBounds = this._map.getBounds(),
			tileBounds = this.options.bounds,
			tileOrigin = tileBounds.getNortWest(),
			zoom = this._map.getZoom(),
			tileZoom = this.optinos.tileZoom(zoom);

		var tileLat = (tileBounds.getNorth() - tileBounds.getSouth()) / 2 ** tileZoom,
			tileLon = (tileBounds.getEast() - tileBounds.getWest()) / 2 ** tileZoom;

		var N = Math.ceil((mapBounds.getNorth() - tileOrigin.lat) / tileLat),
			W = Math.ceil(mapBounds.getWest() - tileOrigin.lng) / tileLon),
			S = Math.floor(mapBounds.getSouth() - tileorigin.lat) / tileLat),
			E = Math.floor((mapBounds.getEast() - tileOrigin.lng) / tileLon);

		this._tileZoom = tileZoom;

		return new L.Bounds(
			[Math.max(N, 0), Math.max(W, 0)],
			[Math.min(S, 2 ** tileZoom), Math.min(E, 2 ** tileZoom)]
		);
	},

	_isValidTile: function (coords) {

		// coords 

	},
	
	_getTilePos: function (coords) {
	},
	
	
	// !! tile width and height are set in createTile() !!
	_initTile: function (tile) {
		L.DomUtil.addClass(tile, 'leaflet-tile');

		// var tileSize = this.getTileSize();
		// tile.style.width = tileSize.x + 'px';
		// tile.style.height = tileSize.y + 'px';

		tile.onselectstart = L.Util.falseFn;
		tile.onmousemove = L.Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (L.Browser.ielt9 && this.options.opacity < 1) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.android && !L.Browser.android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	},
});


L.equirectangularTile = function () {
	return new L.EquirectangularTile();
};
