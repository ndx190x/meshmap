import line_profiler

import ../radar2tile

#profile = line_profiler.LineProfiler(radar2tile.grib2tile.to_image_tile)
profile = line_profiler.LineProfiler(radar2tile.radar.decode_rle_levelvalues)
profile.runcall(radar2tile.main)
profile.print_stats()

