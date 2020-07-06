// Configuration object to export
let config = module.exports = {};

// Argument passed to node when starting app
config.env = process.env.NODE_ENV || 'development';
config.rootPath = process.env.NODE_PATH || ".";

if(process.env.NODE_ENV === 'development'){
    config.port = process.env.SERVER_PORT || 3000;
    config.ip = process.env.SERVER_IP || '192.168.0.1';
    config.timeout = process.env.SERVER_TIMEOUT || 30000;
    config.maxPayload = process.env.SERVER_MAX_PAYLOAD || '100kb';
    config.timerInterval = process.env.SERVER_TIMER_INTERVAL || 90000;
} else {
    config.port = process.env.SERVER_PORT || 3000;
    config.ip = process.env.SERVER_IP || '192.168.0.1';
    config.timeout = process.env.SERVER_TIMEOUT || 60000;
    config.maxPayload = process.env.SERVER_MAX_PAYLOAD || '500kb';
    config.timerInterval = process.env.SERVER_TIMER_INTERVAL || 90000;
}

