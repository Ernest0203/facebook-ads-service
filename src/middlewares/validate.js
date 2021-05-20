module.exports = (schema) => (req, res, next) => { 
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
  };

  let { error, value } = schema.validate(req.body, options);
  if (error) {
    console.log(error);
    next(error);
  }
  req.body = value;
  next();
};