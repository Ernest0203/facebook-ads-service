const config = require('config');
const mongoose = require('mongoose');

const server = require('./server');

const mongo = config.get('db.mongo');
mongoose.connect(mongo.uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => console.info('MongoDB connected...'))
  .catch(err => console.info(err));

const HOST = config.get('server.host');
const PORT = config.get('server.port');

const instance = server.listen(PORT, HOST);

instance.on('listening', () => console.info('Available on:', `${HOST}:${PORT}`));
instance.on('error', (error) => console.error(error));

module.exports = instance;