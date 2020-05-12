#!/bin/bash
set -e;

echo 'db.createUser({user: '$MONGO_NON_ROOT_USERNAME', pwd: '$MONGO_NON_ROOT_PASSWORD', roles: [ { role: "readWrite", db: '$MONGO_INITDB_DATABASE' } ] } )' | mongo localhost:27017/vicinitydb -u bavenir -p bavenir --authenticationDatabase admin  --quiet