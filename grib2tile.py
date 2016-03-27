import numpy as np
from PIL import Image
import os


def to_image_tile(data, def_tile, zoom, pick, directory):
    directory += "/%d" % (zoom)
    os.mkdir(directory)
    print directory

    z = 2 ** zoom
    dx = def_tile["width"]  * z
    dy = def_tile["height"] * z

    for base_y in range(0, def_tile["ny"], dy):
        for base_x in range(0, def_tile["nx"], dx):
            #print("%d/%d/%d" % (zoom, base_x / dx, base_y / dy))
            image_array = np.empty([def_tile["height"], def_tile["width"], 4])
            for y in range (0, def_tile["height"]):
                if base_y + z * y < def_tile["ny"]:
                    for x in range (0, def_tile["width"]):
                        X = base_x + z * x + pick[0]
                        Y = base_y + z * y + pick[1]
                        image_array[y][x] = convert_rgba(data[Y][X])
                else:
                    for x in range (0, def_tile["width"]):
                        image_array[y][x] = convert_rgba(0)
            save_image_fromarray(
                image_array,
                "%s/%d_%d.png" % (directory, base_x / dx, base_y / dy)
            )

def convert_rgba(v):
    if v == 0:
        return [0, 0, 0, 0] # transparent
    elif v <= 1:
        return [102, 255, 255, 255]
    elif v <= 2:
        return [9, 204, 255, 255]
    elif v <= 4:
        return [0, 153, 255, 255]
    elif v <= 6:
        return [51, 102, 255, 255]
    elif v <= 10:
        return [51, 255, 0, 255]
    elif v <= 20:
        return [51, 204, 0, 255]
    elif v <= 40:
        return [255, 255, 0, 255]
    elif v <= 60:
        return [102, 60, 102, 255]
    else:
        return [183, 0, 20, 255]

# save as png 
# http://pillow.readthedocs.org/en/latest/handbook/image-file-formats.html#png
def save_image_fromarray(array, tile_name):
    tile = Image.fromarray(np.uint8(array))
    tile.save(tile_name, "png")


