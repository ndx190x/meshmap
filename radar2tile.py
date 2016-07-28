import grib2tile
import radar

from pprint import pprint

def convert_color(v):
    if v == 0:
        return 0, [0, 0, 0] # transparent
    elif v <= 1:
        return 1, [0, 255, 255]
    elif v <= 5:
        return 2, [0, 153, 255]
    elif v <= 10:
        return 3, [0, 102, 255]
    elif v <= 20:
        return 4, [0, 255, 0]
    elif v <= 30:
        return 5, [255, 255, 0]
    elif v <= 50:
        return 6, [255, 153, 0]
    else:
        return 7, [255, 0, 0]


def_tile = {
    "lat1":    48,
    "lon1":   118,
    "lat2":    20,
    "lon2":   150,
    "ny":    3360,
    "nx":    2560,
    "nlat":   120,
    "nlon":    80
}

def main():
    file = 'radar/data/Z__C_RJTD_20160306190000_RDR_JMAGPV_Ggis1km_Prr10lv_ANAL_grib2.bin'
    directory = 'radar/tiles'

    radar_data = radar.parse_radar(file)
    #pprint(radar_data)

    palette, level_palette = grib2tile.create_palette(radar_data['sec5']['level_values'], convert_color)
    data = radar.decode_compr_data(radar_data, level_palette)

    grib2tile.to_image_tile(data, palette, def_tile, 3, 0, (0, 0), directory)
    grib2tile.to_image_tile(data, palette, def_tile, 2, 1, (0, 0), directory)
    grib2tile.to_image_tile(data, palette, def_tile, 1, 2, (1, 1), directory)

if __name__ == '__main__':
    main()
