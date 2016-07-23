import line_profiler

import radar2tile

profile = line_profiler.LineProfiler(radar2tile.grib2tile.to_image_tile)
profile.runcall(radar2tile.main)
profile.print_stats()

