# cython: profile=True

import numpy as np
cimport numpy as np
from PIL import Image, ImagePalette
import os
from pprint import pprint

DTYPE = np.uint8
ctypedef np.uint8_t DTYPE_t

def to_image_tile(np.ndarray[DTYPE_t, ndim=2] data, palette, def_tile, z, thinout, pick, directory):
    directory += "/%d" % (z)
    if not os.path.exists(directory):
        os.makedirs(directory)
    print directory

    cdef int nx = def_tile["nx"]
    cdef int ny = def_tile["ny"]
    cdef int pick_x = pick[0]
    cdef int pick_y = pick[1]

    cdef int dx = nx / 2 ** z
    cdef int dy = ny / 2 ** z
    cdef int t = 2 ** thinout
    cdef int height = dy / t
    cdef int width = dx / t

    cdef int base_x, base_y, x, y, X, Y
            
    cdef np.ndarray[DTYPE_t, ndim=2] image_array = np.empty([height, width], dtype=DTYPE)

    for base_y in range(0, ny - 1, dy):
        for base_x in range(0, nx - 1, dx):
            #print("%d/%d/%d" % (z, base_x / dx, base_y / dy))
            for y in range (0, height):
                for x in range (0, width):
                    X = base_x + t * x + pick_x
                    Y = base_y + t * y + pick_y
                    image_array[y][x] = data[Y][X];
            save_image_fromarray(
                image_array,
                palette,
                "%s/%d_%d.png" % (directory, base_x / dx, base_y / dy)
            )


def create_palette(level_values, convert_color):
    palette_colors = [] 
    level_palette = []

    for v in level_values:
        index, color = convert_color(v)
        level_palette.append(index)
        if index >= len(palette_colors):
            palette_colors.append(color)

    l = len(palette_colors)
    palette = [0] * 3*l
    for i, color in enumerate(palette_colors):
        palette[i      ] = color[0]
        palette[i + l  ] = color[1]
        palette[i + 2*l] = color[2]
        
    return palette, level_palette

def save_image_fromarray(array, palette_colors, tile_name):
    palette = ImagePalette.ImagePalette(
        "RGB",
        palette_colors,
        len(palette_colors)
    )

    tile = Image.fromarray(array, mode="P")
    tile.putpalette(palette)
    tile.info["transparency"] = 0 # set palette[0] transparent
    tile.save(tile_name, "png")



