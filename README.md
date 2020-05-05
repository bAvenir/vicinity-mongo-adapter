# bAvenir VICINITY adapter

**Current version V.1**

This is a Node.js project that acts as an adapter between VICINITY and other technologies or applications.

The first version aims to support the following interactions:

* Suport Data collection and integration with 3rd party apps
* Support to GATEWAY REST
* Support to GATEWAY EVENTS
* Management of registrations and credentials
* Support for creating Thing Descriptions

### Future versions

* Add support to GATEWAY actions
* Add generic adapters/support for known technologies

## Pre-requisites

### Mandatory 

* Node.js > v12
* Docker

### Recommended for full functionality

* Docker-compose
* Sonarqube server

## How to run

First run **npm install** in the project folder

* Development mode
    * ./_setup.sh --> Build and run development mode
    * ./run.sh --> Run
    * ./stop.sh --> Stop without destroying docker image

* Production mode
    * ./_setup.sh -e prod --> Build and run production mode
    * ./run.sh --> Run
    * ./stop.sh --> Stop without destroying docker image
  
* Run development tools
    * npm run test -> for jest tests
    * npm run analyze -> for sonarqube analysis 

## Linux deployment notes

* Change path in docker-compose file for volumes
    * Replace ./ for ~/<proj-name>/
* Make sure Gateway folder has full permissions
* Make sure iptables are set to make Docker subnet available

## Configuration

Use a .env file

* ENV_VAR=SOMETHING

* Most of the configuration parameters from the example can be reused for production deployment

* Only GTW_ID and GTW_PWD are **MANDATORY**, it is necessary to have valid VICINITY credentials to run the adapter

* SONARQUBE section is not mandatory, add only if you use a sonarqube server for static analysis

Example:

    # Configuration
    #### Environments ["development", "production"]
    NODE_ENV=production
    ## SERVER
    SERVER_PORT=3000
    SERVER_IP=0.0.0.0
    SERVER_TIMEOUT=10000
    SERVER_MAX_PAYLOAD=100kb
    ## GATEWAY
    GTW_HOST="gateway"
    GTW_PORT=8181
    GTW_CALLBACK_ROUTE=agent
    GTW_ROUTE=api
    GTW_TIMEOUT=10000
    #### Add your credentials below, obtain them in the Neighbourhood Manager
    GTW_ID=""
    GTW_PWD=""
    ## ADAPTER
    #### Response Modes ["dummy", "proxy"]
    ADAPTER_RESPONSE_MODE="dummy"
    #### Collection Modes ["dummy", "proxy"]
    ADAPTER_DATA_COLLECTION_MODE="dummy"
    ADAPTER_PROXY_URL="http://192.168.0.1:8000/proxy"
    ## Persistance
    PERSISTANCE_DB="redis"
    PERSISTANCE_DB_HOST="cache-db"
    PERSISTANCE_DB_PORT=6379
    PERSISTANCE_CACHE="enabled"
    PERSISTANCE_CACHE_TTL=60
    ## Sonar-scanner
    SONAR_URL=http://localhost:9000
    SONAR_TOKEN=<ADD_YOUR_TOKEN>
    SONAR_PROJECT_NAME=<ADD_YOUR_PROJECT_NAME>
    SONAR_SOURCES=src
    SONAR_INCLUSIONS=**
    SONAR_TESTS=src/_test
    SONAR_TEST_FILE_PATH=./coverage/test-reporter.xml
    SONAR_COVERAGE_FILE_PATH=./coverage/lcov.info

Load into app using process.env.ENV_VAR and the npm package dotenv.

## DOCKER

The use of DOCKER is recommended. It is possible to run the Node.js app, VICINITY OGWAPI and REDIS out of DOCKER, however this configuration is not supported. 

* To run without DOCKER:
    * Change the hosts and ports in .env to your convenience
    * Update gateway/GatewayConfig.xml --> < agent >NODEJS-APP-HOST</ agent >
    * Install REDIS
    * Install VICINITY OGWAPI

## REDIS

It is used for persisting configuration and caching common requests.

* Decide if caching should be active --> PERSISTANCE_CACHE="enabled" or "disabled"
* Decide time to live of cached requests --> PERSISTANCE_CACHE_TTL=60 (in seconds)

A REDIS instance is necessary to run the adapter, however it is possible to configure a connection to a REDIS instance out of DOCKER using:

* PERSISTANCE_DB_HOST="http://my-server" 
* PERSISTANCE_DB_PORT=my-port-number

## NGINX

NGINX is used as a reverse proxy to improve performance of Node.js app and to terminate SSL connections. However, it is possible to run the application without it. In order to do so: 

* Remove the proxy instance from docker-compose.yml 
* Change the port of the node js server to 9997
* Change in gateway/GatewayConfig.xml --> < agent >bavenir-adapter</ agent >

### Using SSL connections to the adapter

* It is possible to activate HTTPS with NGINX.
    1. Get certificates
    2.  Use HTTPS configuration in nginx/nginx.conf (Uncomment and edit required sections)
    3. Add in docker-compose.yml volumes with the path of the certificates in the proxy section

## Includes

* Management of VICINITY OGWAPI lifecycle
* Reverse Proxy NGINX
* DOCKER configuration
* Persistance and caching REDIS
* Built-in CI with DOCKER
* Testing
* Security features 
* Sonarqube scanner