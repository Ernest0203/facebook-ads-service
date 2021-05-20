const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdSchema = new Schema({
  id: { type: String, required: true },
  account_id: { type: String, required: true },
  campaign_id: { type: String, required: true },
  adset_id: { type: String, required: true },
  creative_id: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  link: { type: String, required: true },
  status: { type: String, required: true },
  budget: { type: String, required: true },
  agentName: { type: String, required: true },
  image:  String,
  buildingNumber: { type: String, required: true },
  streetName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  startTime: Date,
  endTime: Date,
  isRemoved: { type: Boolean, default: false },
  userId: Number,
  userTypeId: Number
}, {
  versionKey: false,
  timestamps: true
});

module.exports = mongoose.model('ads', AdSchema);