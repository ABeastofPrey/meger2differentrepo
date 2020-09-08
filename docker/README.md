# Usage

## Build Image

> Run this command in root path, not docker.Build action will last about 20mins

`docker build -t scara_app_gui:version -f docker/Dockerfile .`

## Run Image

> Please mount /artifacts to get the rpm packages

`docker run --rm -v $PWD/temp:/artifacts scara_app_gui:version`

## Rpm Package

You will get the packages in `$PWD/temp/packages/` folder with root permission, you can chown by yourself

## Notice

- You can generate the packages more than 302 and 703, please add it yourself or contact poppy.zeng@kuka.com
