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
		bounds: new L.latLngBounds([48.0, 118.0], [20.0, 150.0]),
		tileZoom: function (mapZoom) {  // TODO: fractal zoom, auto fit?
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
		return "";
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
			tileOrigin = tileBounds.getNorthWest(),
			zoom = this._map.getZoom(),
			tileZoom = this.options.tileZoom(zoom);

		var tileLat = (tileBounds.getNorth() - tileBounds.getSouth()) / 2 ** tileZoom,
			tileLon = (tileBounds.getEast() - tileBounds.getWest()) / 2 ** tileZoom;

		var N = Math.ceil((mapBounds.getNorth() - tileOrigin.lat) / tileLat),
			W = Math.ceil((mapBounds.getWest() - tileOrigin.lng) / tileLon),
			S = Math.floor((mapBounds.getSouth() - tileOrigin.lat) / tileLat),
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
			tileOrigin = tileBounds.getNorthWest(),
			zoom = coords.z,
			tileLat = (tileBounds.getNorth() - tileBounds.getSouth()) / 2 ** zoom,
			tileLon = (tileBounds.getEast() - tileBounds.getWest()) / 2 ** zoom;

		var latlon = new L.latLng(
			tileOrigin.lat + tileLat * coords.y,
			tileOrigin.lng + tileLon * coords.x
		);

		return this._map.project(latlon);
	},
	
	_getTileSizeCoords: function (coords) {
		var nw = this._getTilePos(coords),
			se = this._getTilePos({ x: coords.x + 1, y: coords.y + 1, z: coords.z });

		return se.subtract(nw);
	},
	
	
	_resetGrid: function () {
	},
	
	// Private method to load tiles in the grid's active zoom level according to map bounds
	_update: function (center) {
		var map = this._map;
		if (!map) { return; }
		var zoom = map.getZoom();

		if (center === undefined) { center = map.getCenter(); }
		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

		var pixelBounds = this._getTiledPixelBounds(center),
		    tileRange = this._pxBoundsToTileRange(pixelBounds),
		    tileCenter = tileRange.getCenter(),
		    queue = [];

		for (var key in this._tiles) {
			this._tiles[key].current = false;
		}

		// _update just loads more tiles. If the tile zoom level differs too much
		// from the map's, let _setView reset levels and prune old tiles.
	//	if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

		// create a queue of coordinates to load tiles from
		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
				var coords = new L.Point(i, j);
				coords.z = this._tileZoom;

				if (!this._isValidTile(coords)) { continue; }

				var tile = this._tiles[this._tileCoordsToKey(coords)];
				if (tile) {
					tile.current = true;
				} else {
					queue.push(coords);
				}
			}
		}

		// sort tile queue to load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
		});

		if (queue.length !== 0) {
			// if its the first batch of tiles to load
			if (!this._loading) {
				this._loading = true;
				// @event loading: Event
				// Fired when the grid layer starts loading tiles
				this.fire('loading');
			}

			// create DOM fragment to append tiles in one batch
			var fragment = document.createDocumentFragment();

			for (i = 0; i < queue.length; i++) {
				this._addTile(queue[i], fragment);
			}

			this._level.el.appendChild(fragment);
		}
	},
	
	_addTile: function (coords, container) {
		var tilePos = this._getTilePos(coords),
		    key = this._tileCoordsToKey(coords);

		var tile = this.createTile(this._wrapCoords(coords), L.bind(this._tileReady, this, coords));

		this._initTile(tile);
		
		// reset tile width, height
		var tileSize = this._getTileSizeCoords(coords);
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
