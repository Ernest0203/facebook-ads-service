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
  listings: [{
    wlId: { type: String, required: true },
    title: { type: String, required: true },
    saleType: { type: String, required: true },
    price: { type: String, required: true },
    link: { type: String, required: true },
    description: String,
    beds: { type: Number, required: true },
    baths: { type: Number, required: true },
    buildingNumber: { type: String, required: true },
    streetName: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: Number, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    imageSrc: { type: String, required: true },
    agentName: { type: String, required: true },
    agentCompany: { type: String, required: true },
  }],
  status: { type: String, required: true },
  budget: { type: String, required: true },
  agentName: { type: String, required: true },
  buttonType: { type: String },
  start_time: Date,
  end_time: Date,
  isRemoved: { type: Boolean, default: false },
  userId: Number,
  userTypeId: Number
}, {
  versionKey: false,
  timestamps: true
});

module.exports = mongoose.model('retargetingAds', RetargetingAdSchema);