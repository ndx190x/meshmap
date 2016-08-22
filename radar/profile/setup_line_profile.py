from distutils.core import setup
from distutils.extension import Extension
from Cython.Distutils import build_ext
import numpy

from Cython.Compiler.Options import directive_defaults

directive_defaults['linetrace'] = True
directive_defaults['binding'] = True


setup(
    cmdclass = {'build_ext': build_ext},
    ext_modules = [
        Extension("radar", ["../radar.pyx"], define_macros=[('CYTHON_TRACE', '1')]),
        Extension("grib2tile", ["../grib2tile.pyx"], define_macros=[('CYTHON_TRACE', '1')])
    ],
    include_dirs = [numpy.get_include()]
)
