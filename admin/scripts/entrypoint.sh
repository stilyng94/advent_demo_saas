#!/bin/sh

set -o pipefail -e

echo "create admin:database"
npm run create:admin:database
echo "tables created"


echo "start app"
exec "$@"
