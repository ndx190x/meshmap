import numpy as np
from PIL import Image
import os

from pprint import pprint

def to_image_tile(data, def_tile, zoom):

    #os.mkdir("tile/0/")
    for lat in range(def_tile["lat1"], def_tile["lat2"], -1):
        for lon in range(def_tile["lon1"], def_tile["lon2"], 1):
            print("0/%d/%d" % (lat, lon))
            image_array = np.empty([120, 80, 4])
            base_point_x = (lon - def_tile["lon1"]) * 80
            base_point_y = (def_tile["lat1"] - lat) * 120
            for x in range (0, 80):
                for y in range (0, 120):
                    image_array[y][x] = convert_rgba(data[base_point_y + y][base_point_x + x])
            save_image_fromarray(image_array, "tile/0/%d_%d.png" % (lat, lon))


    # zoom out
    data2 = np.empty([def_tile["nlats"] / 4, def_tile["nlons"] / 4], dtype=np.float16)

    for iy in range(0, def_tile["nlats"] / 4):
        for ix in range(0, def_tile["nlons"] / 4):
            s = 0
            for jy in range(0, 4):
                s += np.sum(data[4*iy + jy][4*ix : 4*ix + 3])
            data2[iy][ix] = s / 16

    print "data2"
    pprint(data2)

    # os.mkdir("tile/2/")
    for lat in range(def_tile["lat1"], def_tile["lat2"], -4):
        for lon in range(def_tile["lon1"], def_tile["lon2"], 4):
            print("2/%d/%d" % (lat, lon))
            image_array = np.empty([120, 80, 4])
            base_point_x = (lon - def_tile["lon1"]) / 4 * 80
            base_point_y = (def_tile["lat1"] - lat) / 4 * 120
            for x in range (0, 80):
                for y in range (0, 120):
                    image_array[y][x] = convert_rgba(data2[base_point_y + y][base_point_x + x])
            save_image_fromarray(image_array, "tile/2/%d_%d.png" % (lat, lon))


def convert_rgba(v):
    if v == 0:
        return [0, 0, 0, 0] # transparent
    else:
        return [255, 255, 255, 255] # white


def save_image_fromarray(array, tile_name):
    tile = Image.fromarray(np.uint8(array))
    tile.save(tile_name, "png")
    # save as png 
    # http://pillow.readthedocs.org/en/latest/handbook/image-file-formats.html#png


