/*
SERVER configuration module
- Middlewares
- API
- Handling errors
*/

// Global settings and packages
const express = require('express'),
  server = express(),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  swaggerUi = require('swagger-ui-express');

// Load VICINITY AGENT
const vcntagent = require('bavenir-agent');

// Configure express to work with proxy and rate-limit
// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
server.set('trust proxy', 1);

// Load loggers
const Log = vcntagent.classes.logger;
let logger = new Log();

// Load configuration
const config = require('./configuration');

// Load swagger docs
const swaggerDocument = require('../docs/swagger.json');
const swaggerDocumentAgent = require('../node_modules/bavenir-agent/docs/swagger.json');
let swagger_options = {
  customCss: '.swagger-ui .topbar { display: none }'
};

// Load API
let api = vcntagent.api.admin; // Administration API
let agent = vcntagent.api.agent; // Agent API
let proxy = require('./_adapters/_proxy/routes'); // Exposes endpoints that gateway will reach for proxying messages to adapter
let adapter = require('./_adapters/_api/routes'); // Adapter actions (Can be modified)

// Middlewares
server.use(cors())
        .use(bodyParser.urlencoded({ extended: true, limit: config.maxPayload}))
        .use(bodyParser.json({limit: config.maxPayload}))
        .use(cookieParser())
        .use(helmet());

// API 
// If status code > 400, forwards to next middleware for handling
// @TODO set up IP rate-limiter for necessary endpoints (NGINX alternative)
server.use('/agent', proxy);
server.use('/admin', api);
server.use('/api', agent);
server.use('/adapter', adapter);
server.use('/adapterdocs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swagger_options));
server.use('/agentdocs', swaggerUi.serve, swaggerUi.setup(swaggerDocumentAgent, swagger_options));

// error handler 
// @TODO Build in separate module

// Not found request response
server.use(function(req, res) {
    logger.warn('URL not found ' + req.originalUrl, "SERVER");
    res.status(404).send({error: true, 'url': req.originalUrl + ' not found'});
});

// Export my server
module.exports = server;