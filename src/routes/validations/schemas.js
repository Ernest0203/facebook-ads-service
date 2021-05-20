const Joi = require('joi');

const listings = Joi.object().keys({
  wlId: Joi.string().required(),
  title: Joi.string().required(),
  saleType: Joi.string().required(),
  price: Joi.number().integer(),
  link: Joi.string().required(),
  description: Joi.string(),
  beds: Joi.number().integer(),
  baths: Joi.number().integer(),
  buildingNumber: Joi.string().required(),
  streetName: Joi.string().required(),
  neighborhood: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.number().integer().required(),
  lat: Joi.string().required(),
  lng: Joi.string().required(),
  imageSrc: Joi.string().required(),
  agentName: Joi.string().required(),
  agentCompany: Joi.string().required(),
});

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
    imageUrl: Joi.string(),
    status: Joi.string(),
    userId: Joi.number().integer(),
    userTypeId: Joi.number().integer()
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
    status: Joi.string(),
    imageUrl: Joi.string(),
  }),
  addRetargeting: Joi.object().keys({ 
    agentName: Joi.string().required(),
    startTime: Joi.string(),
    endTime: Joi.string(),
    budget: Joi.string().pattern(/^[0-9]+$/).required(),
    listings: Joi.array().items(listings).required(),
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
    listings: Joi.array().items(listings).required(),
    status:  Joi.array(),
    buttonType:  Joi.array()
  })
}; 

module.exports = schemas;