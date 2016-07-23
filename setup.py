from distutils.core import setup
from distutils.extension import Extension
from Cython.Distutils import build_ext
import numpy

setup(
    cmdclass = {'build_ext': build_ext},
    ext_modules = [
        Extension("radar", ["radar.pyx"]),
        Extension("grib2tile", ["grib2tile.pyx"])
    ],
    include_dirs = [numpy.get_include()]
)
