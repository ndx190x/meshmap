from distutils.core import setup
from distutils.extension import Extension
from Cython.Distutils import build_ext

setup(
    cmdclass = {'build_ext': build_ext},
    ext_modules = [
        Extension("radar", ["radar.py"]),
        Extension("grib2tile", ["grib2tile.py"])
    ]
)
