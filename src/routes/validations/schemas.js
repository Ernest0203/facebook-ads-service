const Joi = require('joi');

const schemas = { 
  add: Joi.object().keys({ 
    agentName: Joi.string().required(),
    startTime: Joi.string(),
    endTime: Joi.string(),
    buildingNumber: Joi.string().required(),
    streetName: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    budget: Joi.string().pattern(/^[0-9]+$/).required(),
    link: Joi.string().required(),
    body: Joi.string().required(),
    userId: Joi.number().integer(),
    userTypeId: Joi.number().integer(),
  }),
  update: Joi.object().keys({ 
    agentName: Joi.string(),
    startTime: Joi.string(),
    endTime: Joi.string(),
    buildingNumber: Joi.string(),
    streetName: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    budget: Joi.number().integer(),
    link: Joi.string(),
    body: Joi.string(),
  }),
  addRetargeting: Joi.object().keys({ 
    agentName: Joi.string().required(),
    startTime: Joi.string(),
    endTime: Joi.string(),
    budget: Joi.string().pattern(/^[0-9]+$/).required(),
    listings: Joi.array().required(),
    status:  Joi.array(),
    buttonType:  Joi.array(),
    userId: Joi.number().integer(),
    userTypeId: Joi.number().integer(),
  }),
  updateRetargeting: Joi.object().keys({ 
    agentName: Joi.string(),
    startTime: Joi.string(),
    endTime: Joi.string(),
    budget: Joi.number().integer(),
    listings: Joi.array(),
    status:  Joi.array(),
    buttonType:  Joi.array(),
  }),
}; 

module.exports = schemas;