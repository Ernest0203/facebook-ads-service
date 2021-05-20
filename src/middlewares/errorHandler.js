const winston = require('winston');
const Boom = require('@hapi/boom');
const response = require('../utils/response');
const path = require('path');

winston.loggers.add('error', {
  transports: [
    new winston.transports.Console({ level: 'silly' }),
    new winston.transports.File({ filename: path.resolve(__dirname, '../errors.log') })
  ]
});

const eject = (arr, key) => arr.map((item) => item[key]);

const handleJoi = (err, res) => response(res)
  .errors(eject(err.details, 'message'), 400);

const handleBoomError = (req, res, boom) => {
  const { statusCode, message } = boom.output.payload;

  if (boom.output.statusCode === 500) {
    winston.loggers.get('error').error(boom);
  }

  if (process.env.NODE_ENV !== "production") console.log(boom);

  response(res).error(message, statusCode);
};

const handleMongoose = (err, res) => response(res)
  .errors(eject(Object.values(err.errors), 'message'), 400);

module.exports = (err, req, res) => {
  const handle = (error) => handleBoomError(req, res, error);

  if (err instanceof Error) {
    if (err.isJoi) {
      return handleJoi(err, res);
    }

    if (err.isBoom) {
      return handle(err);
    }
  }

  if (err.type === 'entity.parse.failed') { // JSON parse error
    return handle(Boom.badRequest());
  }

  if (err.name === 'UnauthorizedError') { // jwt error
    return handle(Boom.unauthorized());
  }

  if (err.name === 'ValidationError') { // mongoose validation error
    return handleMongoose(err, res);
  }

  if (err.name === 'CastError') { // mongoose cast error
    return handle(Boom.badRequest());
  }

  if (err.name === 'DocumentNotFoundError') { // mongoose document not found error
    return handle(Boom.notFound());
  }

  return handle(Boom.boomify(err)); // other errors
};
