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


	getTileUrl: function (coords) {

	},

	// !! 
	//getTileSize: function () {
		// tile latlonbounds -> point bounds -> height, width
	//},



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
			tileZoom = this.options.tileZoom(zoom);

		var tileLat = (tileBounds.getNorth() - tileBounds.getSouth()) / 2 ** tileZoom,
			tileLon = (tileBounds.getEast() - tileBounds.getWest()) / 2 ** tileZoom;

		var N = Math.ceil((mapBounds.getNorth() - tileOrigin.lat) / tileLat),
			W = Math.ceil(mapBounds.getWest() - tileOrigin.lng) / tileLon),
			S = Math.floor(mapBounds.getSouth() - tileorigin.lat) / tileLat),
			E = Math.floor((mapBounds.getEast() - tileOrigin.lng) / tileLon);

		this._tileZoom = tileZoom;

		return new L.Bounds(
			[Math.max(W, 0), Math.max(N, 0)],
			[Math.min(E, 2 ** tileZoom), Math.min(S, 2 ** tileZoom)]
		);
	},

	_isValidTile: function (coords) {
		return true;
	},
	
	_getTilePos: function (coords) {
		var tileBounds = this.options.bounds,
			tileOrigin = tileBounds.getNortWest(),
			zoom = coords.z,
			tileLat = (tileBounds.getNorth() - tileBounds.getSouth()) / 2 ** zoom,
			tileLon = (tileBounds.getEast() - tileBounds.getWest()) / 2 ** zoom;

		var latlon = new L.LatLon(
			tileOrigin.getNorth() + tileLat * coords.y,
			tileOrigin.getWest() + tileLon * coords.x
		);

		return this._map.project(latlon);
	},
	
	_getTileSizeCoords: function (coords) {
		var nw = _getTilePos(coords),
			se = _getTilePos({ x: coords.x + 1, y coords.y + 1, z: coords.z });

		return se.substract(nw);
	},
	
	
	_addTile: function (coords, container) {
		var tilePos = this._getTilePos(coords),
		    key = this._tileCoordsToKey(coords);

		var tile = this.createTile(this._wrapCoords(coords), L.bind(this._tileReady, this, coords));

		this._initTile(tile);
		
		// reset tile width, height
		var tileSize = this.getTileSizeCoords();
		tile.style.width = tileSize.x + 'px';
		tile.style.height = tileSize.y + 'px';

		// if createTile is defined with a second argument ("done" callback),
		// we know that tile is async and will be ready later; otherwise
		if (this.createTile.length < 2) {
			// mark tile as ready, but delay one frame for opacity animation to happen
			L.Util.requestAnimFrame(L.bind(this._tileReady, this, coords, null, tile));
		}

		L.DomUtil.setPosition(tile, tilePos);

		// save tile in cache
		this._tiles[key] = {
			el: tile,
			coords: coords,
			current: true
		};

		container.appendChild(tile);
		// @event tileloadstart: TileEvent
		// Fired when a tile is requested and starts loading.
		this.fire('tileloadstart', {
			tile: tile,
			coords: coords
		});
	},
});


L.equirectangularTile = function () {
	return new L.EquirectangularTile();
};
