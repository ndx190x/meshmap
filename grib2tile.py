import numpy as np
from PIL import Image

def to_image_tile(data):
    lat1 = 48
    lon1 = 118
    lat2 = 20
    lon2 = 150
    nlats = 3360
    nlons = 2560
    tile_width = 2560 / 32
    tile_height = 3360 / 28

    for lat in range(lat1, lat2, -1):
        for lon in range(lon1, lon2, 1):
            print("%d/%d" % (lat, lon))
            image_array = np.empty([120, 80, 4])
            base_point_x = (lon - lon1) * 80
            base_point_y = (lat1 - lat) * 120
            for x in range (0, 80):
                for y in range (0, 120):
                    image_array[y][x] = convert_rgba(data[base_point_y + y][base_point_x + x])
            save_image_fromarray(image_array, "tile/%d_%d.png" % (lat, lon))


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


