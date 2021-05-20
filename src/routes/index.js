const express = require('express');
const router = express.Router();
const config = require('config');
var jwt = require('express-jwt');

const ads = require('./ads');
const retargetingAds = require('./retargetingAds');

router
  .use(jwt({ secret: config.get('jwt.secret'), algorithms: ['HS256'] }))
  .use('/ads', ads)
  .use('/retargeting-ads', retargetingAds);

module.exports = router; 
