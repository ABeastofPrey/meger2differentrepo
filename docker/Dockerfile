FROM node:12.4.0-stretch
ARG APT_SOURCE="http://mirrors.ustc.edu.cn"
RUN sed -i /etc/apt/sources.list -e "s#http[s]\{0,1\}\:\/\/[a-zA-Z0-9.]*#${APT_SOURCE}#g"
LABEL maintainer="poppy.zeng@kuka.com"
# To make it easier for build and release pipelines to run apt-get,
# configure apt to not require confirmation (assume the -y argument by default)
WORKDIR /App

ENV NG_CLI_ANALYTICS=ci

RUN apt-get update \
&& apt-get install -y --no-install-recommends \
         alien \
         dpkg-dev \
         debhelper \
         build-essential \
&& apt clean

ADD . .

RUN cp docker/.npmrc .npmrc \
&& sed -i "s/https:\/\/registry.npmjs.org/https:\/\/pkg.apac.int.kuka.com\/artifactory\/api\/npm\/npm-proxy/g" package-lock.json \
&& npm install \
&& node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod \
&& chmod 755 docker/DEBIAN/preinst \
&& chmod 755 docker/build_rpm.sh \
&& export PACKAGE_TYPE=302 \
&& ./docker/build_rpm.sh \
&& export PACKAGE_TYPE=703 \
&& ./docker/build_rpm.sh \
&& mkdir -p /packages/  \
&& cp /builds/*.rpm /packages \
&& rm -rf node_modules \
&& rm -rf /builds

CMD [ "cp","-r", "/packages", "/artifacts/" ]