import numpy as np
from PIL import Image
import os


def to_image_tile(data, def_tile, zoom, directory):
    directory += "/%d" % (zoom)
    os.mkdir(directory)
    for lat in range(def_tile["lat1"], def_tile["lat2"], -zoom):
        for lon in range(def_tile["lon1"], def_tile["lon2"], zoom):
            #print("%d/%d/%d" % (zoom, lat, lon))
            image_array = np.empty([def_tile["height"], def_tile["width"], 4])
            base_point_x = (lon - def_tile["lon1"]) * def_tile["nlon"]
            base_point_y = (def_tile["lat1"] - lat) * def_tile["nlat"]
            for y in range (0, def_tile["height"]):
                for x in range (0, def_tile["width"]):
                    image_array[y][x] = convert_rgba(data[base_point_y + y][base_point_x + x])
            save_image_fromarray(image_array, "%s/%d_%d.png" % (directory, lat, lon))



def convert_rgba(v):
    if v == 0:
        return [0, 0, 0, 0] # transparent
    else:
        return [255, 255, 255, 255] # white

# save as png 
# http://pillow.readthedocs.org/en/latest/handbook/image-file-formats.html#png
def save_image_fromarray(array, tile_name):
    tile = Image.fromarray(np.uint8(array))
    tile.save(tile_name, "png")


