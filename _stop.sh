#!/bin/bash
USAGE="$(basename "$0") [-h]
-- Stops all infrastructure
-- Removes containers
-- Examples
./_stop.sh
Where:
  Flags:
      -h  Shows help"

# Kill and remove old proxy containers
docker kill proxy bavenir-adapter gateway cache-db mongodb
docker rm proxy bavenir-adapter gateway cache-db mongodb
docker rm $(docker ps -a -q) # Remove zombi containers