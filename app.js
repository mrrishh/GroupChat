global.app_constants = require('./utilities/constants');
global.http_response = require('./utilities/http_response');


const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    http = require('http'),
    router = require('./routes/routes'),
    WebSockets = require('./utilities/web_socket'),
    socketio = require("socket.io"),
    path = require("path"),
    admin = require('./utilities/create_admin');


app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));
app.use(express.static('./'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Client-Os, uid, token, country_code, client_source, user_id, role_type, role_id');
    next();
});

app.route('/').get(function (req, res) {
    res.sendFile(path.resolve(__dirname + "/views/index.html"));
});
app.use('/api', router);

/** Get port from environment and store in Express. */
const port = process.env.PORT || "8080";
app.set("port", port);


/** Create HTTP server. */
const server = http.createServer(app);
/** Create socket connection */
global.io = socketio.listen(server);
global.io.on('connection', WebSockets.connection)
/** Listen on provided port, on all network interfaces. */
server.listen(port);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
    console.log(`Listening on port:: http://localhost:${port}/`)
});



module.exports = app;