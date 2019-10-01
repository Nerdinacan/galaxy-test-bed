#!/usr/bin/env bash

for ARGUMENT in "$@"
do
    KEY=$(echo $ARGUMENT | cut -f1 -d=)
    VALUE=$(echo $ARGUMENT | cut -f2 -d=)
    case "$KEY" in
        GALAXYPATH) GALAXYPATH=${VALUE} ;;
        *)
    esac
done

echo "$(pwd)"

docker run --rm \
    -d \
    -p 80:80 \
    -v "$(pwd)/proxy/testbed.conf:/etc/nginx/nginx.conf:ro" \
    -v "${GALAXYPATH}/static:/usr/share/nginx/html/static" \
    nginx
