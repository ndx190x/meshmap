# MeshMap

Create mesh tiles and project to web maps.  
Fit equirectangular grid mesh data to spherical mercator.

+ Google Maps http://tattii.github.io/meshmap/radar/radar.html
+ Leaflet http://tattii.github.io/meshmap/radar/radar-leaflet.html

## Usage
```
$ pip install -r requirements.txt
$ cd radar
$ python setup.py build_ext --inplace
$ wget <radar file>
$ tar -xf <radar file>
$ python radar2tile.py <radar Ggis1km>
```

