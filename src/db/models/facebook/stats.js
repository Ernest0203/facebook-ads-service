const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatSchema = new Schema({
  ad_id: { type: String, required: true },
  impressions: { type: Number, required: true },
  clicks: { type: Number, required: true },
  spend: { type: Number, required: true },
  day: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  date_start: { type: String, required: true },
  date_stop: { type: String, required: true },

}, {
  versionKey: false,
  timestamps: true
});

module.exports = Stats = mongoose.model('stats', StatSchema);