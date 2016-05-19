/*
 * @class L.equrectangularTile
 * @inherits GridLayer
 *
 *
 *
 *
 *
 *
 */

L.EquirectangularTile = L.GridLayer.extend({


	options: {},

	initialize: function () {

	},

	createTile: function (coord, done) {

	},

	// !! 
	getTileSize: function (coords) {

	},


	// override GridLayer Methods
	//
	//
	// invalid _tileCoordsToBounds, _keyToBounds, _globalTileRange

	_pxBoundsToTileRange: function (bounds) {

	},
	
	_isValidTile: function (coords) {
	},
	
	_getTilePos: function (coords) {
		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
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
