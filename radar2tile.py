import grib2tile

import numpy as np
from io import BytesIO
import struct
from pprint import pprint


def parse_radar(file):
    fileptr = open(file, 'rb')

    # section.4
    fileptr.seek(16 + 21 + 72 + 7)
    if struct.unpack('>H', fileptr.read(2))[0] != 50008 : return
    sec4 = parse_pdt_4_50008(fileptr)

    # section.5
    fileptr.seek(16 + 21 + 72 +  82 + 9)
    if struct.unpack('>H', fileptr.read(2))[0] != 200 : return
    sec5 = parse_drt_5_200(fileptr)

    # section.7
    fileptr.seek(16 + 21 + 72 +  82 + 519 + 6)
    compr_data = parse_7_data(fileptr)

    data = decode_rle_levelvalues(compr_data, 2560*3360, 8, sec5['max_value'], sec5['level_values'])
    return np.reshape(data, (3360, 2560))


def parse_pdt_4_50008(fileptr):
    format = '>5B H 2B I 2B I 2B I H 6B H 3B H B H 8s 8s 8s'
    d = struct.unpack(
        format,
        fileptr.read(struct.calcsize(format)))
    return {
        'parameter_category': d[0],
        'parameter_number': d[1],
        'year': d[15],
        'month': d[16],
        'day': d[17],
        'hour': d[18],
        'minute': d[19],
        'second': d[20]
    }


def parse_drt_5_200(fileptr):
    format = '>B 2H B 251H'
    d = struct.unpack(
        format,
        fileptr.read(struct.calcsize(format)))
    drt = {
        'nbit': d[0],
        'max_value': d[1],
        'max_value_level': d[2],
        'decimal_scale_factor': d[3],
        'level_values': [-0.] # no data
    }
    scale_factor = pow(10., d[3])
    for v in d[4:]:
        drt['level_values'].append(v / scale_factor)
    return drt

def parse_7_data(fileptr):
    sec7_length = struct.unpack('>I', fileptr.read(4))[0]
    struct.unpack('>B', fileptr.read(1))
    data = fileptr.read(sec7_length - 5)
    return np.fromstring(data, dtype='>B')


def decode_rle_levelvalues(compr_data, ndata, nbit, maxv, level_values):
    out = np.empty(ndata, dtype='float16')
    lngu = pow(2, nbit) - 1 - maxv
    pv = -1
    k = 0
    count = 1
    n = 0
    for v in np.nditer(compr_data):
        if v <= maxv:
            if pv >= 0:
                out[k: k + count] = pv
                k += count
            count = 1
            n = 0
            pv = level_values[v]
        else:
            count += pow(lngu, n) * (v - maxv - 1)
            n += 1
    out[k: k + count] = pv
    return out

def_tile = {
    "lat1": 48,
    "lon1": 118,
    "lat2": 20,
    "lon2": 150,
    "nlats": 3360,
    "nlons": 2560,
    "tile_width": 80,
    "tile_height": 120
}

file = 'radar/Z__C_RJTD_20160306190000_RDR_JMAGPV_Ggis1km_Prr10lv_ANAL_grib2.bin'
data = parse_radar(file)
pprint(data)
grib2tile.to_image_tile(data, def_tile, 0)

