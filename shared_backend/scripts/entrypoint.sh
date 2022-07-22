#!/bin/sh

set -o pipefail -e

echo "create:database"
npm run create:database
echo "tables created"


echo "start app"
exec "$@"
