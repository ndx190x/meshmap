from redis import Redis
import numpy as np

import sys
import math

import mercantile

redis = Redis()


def get_tile(tx, ty, zoom):
    print tx, ty, zoom
    bounds = mercantile.bounds(tx, ty, zoom)
    print bounds

    lat1 = int(bounds.north)
    lat2 = int(bounds.south)
    lon1 = int(bounds.west)
    lon2 = int(bounds.east)

    tile = np.zeros((256, 256))

    tile_base = mercantile.xy(*mercantile.ul(tx, ty, zoom))
    print tile_base

    for lat in range(lat2, lat1 + 1):
        for lon in range(lon1, lon2 + 1):
            key = "meshmap:block:%d:%d" % (lat, lon)
            block = np.frombuffer(redis.get(key), dtype=np.uint8)
            block = block.reshape((120, 80))

            blat1 = min(lat + 1, bounds.north)
            blat2 = max(lat, bounds.south)
            blon1 = max(lon, bounds.west)
            blon2 = min(lon + 1, bounds.east)
            
            print blat1, blat2, blon1, blon2

            p1 = mercantile.xy(blon1, blat1)
            p2 = mercantile.xy(blon2, blat2)

            print p1, p2

            print p1[0] - tile_base[0], p1[1] - tile_base[1]


if __name__ == '__main__':
    get_tile(int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]))

