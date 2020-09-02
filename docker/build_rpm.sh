#!/bin/bash

mkdir -p /builds/cs_$PACKAGE_TYPE/usr/share/rs

cp -r docker/DEBIAN /builds/cs_$PACKAGE_TYPE/

cp -r dist/* /builds/cs_$PACKAGE_TYPE/usr/share/rs

cd /builds

mv cs_$PACKAGE_TYPE/DEBIAN/$PACKAGE_TYPE.control  cs_$PACKAGE_TYPE/DEBIAN/control

dpkg-deb --build cs_$PACKAGE_TYPE

alien -r -c *.deb

rm *.deb


