const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer');
const validate = require('../middlewares/validate');
const schemas = require('./validations/schemas');

const { getAdById, getAd, getAds, createAd, updateAd, deleteAd, getStats } = require('../controllers/ads');

router
  .get('/', getAds)
  .get('/:id', getAd)
  .get('/stats', getStats)
  .post('/', multer.any(), validate(schemas.add), createAd)
  .post('/:id', multer.any(), validate(schemas.update), updateAd)
  .delete('/:id', deleteAd)
  .param('id', (req, res, next, id) => {
    if (id === 'stats')  return getStats(req, res);
    return getAdById(req, res, next, id);
  })

module.exports = router;