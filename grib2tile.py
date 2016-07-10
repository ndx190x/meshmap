import numpy as np
from PIL import Image
import os


def to_image_tile(data, def_tile, z, thinout, pick, directory):
    directory += "/%d" % (z)
    os.mkdir(directory)
    print directory

    dx = def_tile["nx"] / 2 ** z
    dy = def_tile["ny"] / 2 ** z

    t = 2 ** thinout
    height = dy / t
    width = dx / t

    for base_y in range(0, def_tile["ny"] - 1, dy):
        for base_x in range(0, def_tile["nx"] - 1, dx):
            #print("%d/%d/%d" % (z, base_x / dx, base_y / dy))
            image_array = np.empty([height, width, 4])
            for y in range (0, height):
                for x in range (0, width):
                    X = base_x + t * x + pick[0]
                    Y = base_y + t * y + pick[1]
                    image_array[y][x] = convert_rgba(data[Y][X])
            save_image_fromarray(
                image_array,
                "%s/%d_%d.png" % (directory, base_x / dx, base_y / dy)
            )

def convert_rgba(v):
    if v == 0:
        return [0, 0, 0, 0] # transparent
    elif v <= 1:
        return [0, 255, 255, 255]
    elif v <= 5:
        return [0, 153, 255, 255]
    elif v <= 10:
        return [0, 102, 255, 255]
    elif v <= 20:
        return [0, 255, 0, 255]
    elif v <= 30:
        return [255, 255, 0, 255]
    elif v <= 50:
        return [255, 153, 0, 255]
    else:
        return [255, 0, 0, 255]

# save as png 
# http://pillow.readthedocs.org/en/latest/handbook/image-file-formats.html#png
def save_image_fromarray(array, tile_name):
    tile = Image.fromarray(np.uint8(array))
    tile.save(tile_name, "png")


