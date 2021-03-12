const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const schemas = require('./validations/schemas');

const { getAdById, getAd, getAds, createAd, updateAd, deleteAd, getStats } = require('../controllers/retargetingAds');

router
  .get('/', getAds)
  .get('/:id', getAd)
  .get('/stats', getStats)
  .post('/', validate(schemas.addRetargeting), createAd)
  .post('/:id', validate(schemas.updateRetargeting), updateAd)
  .delete('/:id', deleteAd)
  .param('id', (req, res, next, id) => {
    if (id === 'stats')  return getStats(req, res);
    return getAdById(req, res, next, id);
  })

module.exports = router;