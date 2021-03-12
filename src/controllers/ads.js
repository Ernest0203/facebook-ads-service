const aqp = require('api-query-params');
const asyncHandler = require('express-async-handler');
const { Ads, Stats } = require('../db/models/index');
const facebookApi = require('../api/facebook');
const response = require('../utils/response');

const getAdById = async (req, res, next, id) => {
  const ad = await Ads.findById({ _id: id }).orFail();
  req.data = ad;
  next();
};

const getAd = (req, res) => {
  response(res).success(req.data);
};

const getAds = (req, res) => {
  Object.keys(req.query).forEach(k => (!req.query[k] && req.query[k] !== undefined) && delete req.query[k]);
  let { filter, sort, limit, skip } = aqp(req.query);
  return Ads.find({ isRemoved: false, ...filter })
    .skip(skip)
    .limit(limit || 100)
    .sort(sort)
    .then(ads => response(res).success(ads));
};

const createAd = async (req, res) => {
  const query = { ...req.body };
  if (req.files && req.files.length > 0) query.image = req.files[0];
  const adFromApi = await facebookApi.createComplexAd(query);
  const ad = await Ads.create(adFromApi);
  response(res).success(ad);
};

const updateAd = async (req, res) => {
  const query = { ...req.body }; 
  if (req.files && req.files.length > 0) query.image = req.files[0];
  const adFromApi = await facebookApi.updateAd(req.data, query);
  const updatedAd = await Ads.findOneAndUpdate({id: adFromApi.id}, adFromApi, { new: true, upser: true });
  console.log(updatedAd);
  response(res).success(updatedAd);
};

const deleteAd = async (req, res) => {
  const response = await facebookApi.deleteAd(req.data)
  if (response.success) Ads.findByIdAndUpdate({ _id: req.data._id }, { isRemoved: true }, { new: true, upser: true })
    .then(result => response(res).success(result._id));
};

const getStats = async (req, res) => {
  const { from, to, isSum, group, isIgnoreRemoved} = req.query;
  if (req.query.filter) Object.keys(req.query.filter).forEach(k => (!req.query.filter[k] && req.query.filter[k] !== undefined) && delete req.query.filter[k]);
  const { filter, limit, skip } = aqp(req.query.filter);

  const query = { isRemoved: false, ...filter};
  if (isIgnoreRemoved) { delete query.isRemoved; };

  const adsIds = await Ads.find(query).then(res => res.map(item => item.id));

  let aggregateMatch = { ad_id: { $in: adsIds }};
  if (from && to) aggregateMatch.createdAt = { $gt: new Date(from), $lt: new Date(to) };
  
  let aggregateGroup = {
    _id: group === 'month' ? {month: '$month', year: '$year'} : '$date_start',
    impressions: { $sum: '$impressions' },
    clicks: { $sum: '$clicks' },
    spend: { $sum: '$spend' },
    day: {'$first': '$day'},
    month: {'$first': '$month'},
    year: {'$first': '$year'}
  };

  if (isSum) aggregateGroup = {
    _id: 0,
    impressions: { $sum: '$impressions' },
    clicks: { $sum: '$clicks' },
    spend: { $sum: '$spend' },
  };

  const stats = await Stats.aggregate([
    { $match: aggregateMatch },
    { $group: aggregateGroup },
    { $project: { _id: 0, impressions: 1, clicks: 1, spend: 1, day: { $cond: [group === 'month', 0, 1] }, month: 1, year: 1 } },
    { $skip: skip || 0 },
    { $limit: limit || 100 },
  ]);

  response(res).success(stats);
};

module.exports = {
  getAdById: asyncHandler(getAdById),
  getAd: asyncHandler(getAd),
  getAds: asyncHandler(getAds),
  getStats: asyncHandler(getStats),
  createAd: asyncHandler(createAd),
  updateAd: asyncHandler(updateAd),
  deleteAd: asyncHandler(deleteAd),
};