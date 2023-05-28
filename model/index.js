const mongoose = require('mongoose'),
    mongodb = mongoose.connection;

const uri = "mongodb://localhost:27017/chat"
mongoose.connect(uri, {
    useNewUrlParser: true, useUnifiedTopology: true,
    autoIndex: false, // Don't build indexes
    poolSize: 10

});

mongoose.set('debug', true);
mongodb.on('error', error => console.log('[uncaughtException] message : ' + error.message));
mongodb.once('open', () => console.log('We are successfully connected with mongoDB '));

module.exports = mongodb