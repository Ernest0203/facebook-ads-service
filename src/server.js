const express = require('express');
const routes = require('./routes/index');
const cors = require('cors');
const path = require('path');
var queue = require('express-queue');
const errorHandler = require('./middlewares/errorHandler');

const app = express(); 

app.use(express.json());
app.use(cors());
app.use(queue({ activeLimit: 1, queuedLimit: 2 }));
app.use(routes);
app.use(errorHandler);

app.use(express.static('src'));
app.use('/resources', express.static(path.join(__dirname, '../resources')));

module.exports = app;