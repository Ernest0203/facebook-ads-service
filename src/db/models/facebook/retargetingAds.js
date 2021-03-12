const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RetargetingAdSchema = new Schema({
  id: { type: String, required: true },
  account_id: { type: String, required: true },
  campaign_id: { type: String, required: true },
  catalog_id: { type: String, required: true },
  feed_id: { type: String, required: true },
  adset_id: { type: String, required: true },
  creative_id: { type: String, required: true },
  listings: [],
  status: { type: String, required: true },
  budget: { type: String, required: true },
  agentName: { type: String, required: true },
  buttonType: { type: String },
  start_time: Date,
  end_time: Date,
  isRemoved: { type: Boolean, default: false },
  userId: Number,
  userTypeId: Number,
}, {
  versionKey: false,
  timestamps: true,
});

module.exports = RetargetingAds = mongoose.model('retargetingAds', RetargetingAdSchema);