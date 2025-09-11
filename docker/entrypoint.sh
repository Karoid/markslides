#!/bin/sh
set -e

echo "# ####################### #"
echo "#     install packages    #"
echo "# ####################### #"
npm install

echo "# ####################### #"
echo "#   generate prisma client #"
echo "# ####################### #"
npx prisma generate

echo "# ####################### #"
echo "#      deploy db schema      #"
echo "# ####################### #"
npx prisma migrate deploy

exec "$@"