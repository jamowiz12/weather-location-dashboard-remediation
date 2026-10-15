#!/bin/sh
set -eu

: "${PORT:=10000}"

case "$PORT" in
    ''|*[!0-9]*)
        echo 'PORT must be a numeric TCP port.' >&2
        exit 1
        ;;
esac

if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo 'PORT must be between 1 and 65535.' >&2
    exit 1
fi

: "${APP_KEY:?Set the existing Laravel APP_KEY in the Render environment.}"

if [ "${APP_ENV:-production}" != 'production' ] || [ "${APP_DEBUG:-false}" != 'false' ]; then
    echo 'Set APP_ENV=production and APP_DEBUG=false in the Render environment.' >&2
    exit 1
fi

sed -ri "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/\\*:80/*:${PORT}/" /etc/apache2/sites-available/000-default.conf

exec apache2-foreground