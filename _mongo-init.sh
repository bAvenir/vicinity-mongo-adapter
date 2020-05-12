MYPATH=$(pwd)
docker run -d --env-file .env -v $MYPATH/mongo/volume:/data/db -v $MYPATH/mongo/init:/docker-entrypoint-initdb.d --name mongodb mongo:latest 
echo Working on it, it will take a minute...
sleep 45s
docker exec -it mongodb bash /docker-entrypoint-initdb.d/custom-user.sh 
docker kill mongodb
docker rm mongodb
echo Initialization completed!