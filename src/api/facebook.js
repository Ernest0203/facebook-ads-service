const fs = require('fs').promises;
const config = require('config');
const adsSdk = require('facebook-nodejs-business-sdk');
const createCsv = require('../utils/createCsv');
const { Stats } = require('../db/models/index');

const facebook = config.get('facebook');
let { accessToken, adAccountId, pageId, businessId, pixelId } = facebook;

const AdAccount = adsSdk.AdAccount;
const Campaign = adsSdk.Campaign;
const AdSet = adsSdk.AdSet;
const AdCreative = adsSdk.AdCreative;
const Ad = adsSdk.Ad;
const Business = adsSdk.Business;
const ProductCatalog = adsSdk.ProductCatalog;
const ProductFeed = adsSdk.ProductFeed;
const ProductFeedUpload = adsSdk.ProductFeedUpload;
const AdImage = adsSdk.AdImage;

adsSdk.FacebookAdsApi.init(accessToken);
const account = new AdAccount(`act_${adAccountId}`);
const business = new Business(businessId);

const getQuery = (concurrence, args) => {
  return concurrence.reduce((res, current) => ({ ...res, [current]: args[current] }) ,{});
};

/*
  AD ARGUMENTS
*/

const adsManagerArgs = {
  campaign: {
    name: '',
    objective: 'LINK_CLICKS',
    special_ad_categories: ['HOUSING'],
  },
  adSet: {
    name : '',
    optimization_goal : 'LINK_CLICKS',
    billing_event : 'IMPRESSIONS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',    
    promoted_object : {'page_id': pageId},
    campaign_id : '',
    targeting : {
      flexible_spec: [{interests: [{ id: '6003103732434', name: 'Квартира' },{ id: '6003143191640', name: 'Property finder' },{ id: '6003249974776', name: 'Rent.com' },{ id: '6003307244821', name: 'Trulia' },{ id: '6003496612657', name: 'Homes.com' },{ id: '6003708816383', name: 'Apartments.com' },{ id: '6003909817136', name: 'Zillow' },{ id: '6009973744306', name: 'Apartment List' }]}],
      geo_locations:{
        custom_locations: [{
          distance_unit: 'kilometer',
          radius: 25,
          country: 'US'
        }]
      },
      publisher_platforms: [ 'facebook', 'instagram', 'audience_network' ],
      facebook_positions: ['feed','groups_feed','right_hand_column','video_feeds','instant_article','instream_video','marketplace','story','search'],
      instagram_positions: [ 'stream', 'story', 'explore' ],
      device_platforms: [ 'mobile', 'desktop' ],
      audience_network_positions: [ 'classic', 'rewarded_video' ]
    },
  },
  ad: {
    name : '',
    tracking_specs : [ {'action.type': ['offsite_conversion'], 'fb_pixel': [pixelId]} ],
    adset_id: ''
  },
  adCreative: {
    id: adAccountId,
    name: 'Creative',
    object_story_spec: {
      page_id: pageId,
      link_data: {
        link: 'https://listing3d.com/120-ocean-drive-south-beach-miami-beach-fl/sYQAAC_kAAAQy',
        message: 'Creative body',
        caption: 'listing3d.com',
        attachment_style: 'link',
        description: 'creative desc',
        call_to_action: { type: 'LEARN_MORE' }
      }
    }
  }
};

/*
  RETARGETING AD ARGUMENTS
*/

const catalogArgs = {
  campaign: {
    name: 'Campaign from catalog',
    objective: 'PRODUCT_CATALOG_SALES',
    special_ad_categories: ['HOUSING'],
    promoted_object : {'product_catalog_id': ''},
    status: 'ACTIVE'
  },

  adCreative: {
    id: adAccountId,
    name: 'Creative',
    product_set_id : '',
    applink_treatment : 'web_only',
    object_story_spec : {
      page_id: pageId,
      template_data: {
        call_to_action: { type: 'LEARN_MORE' },
        link: 'https://listing3d.com',
        name: '{{home_listing.name}}', 
        message: '{{home_listing.description}}'
      }
    }
  }
};

/*
  ADS 
*/

const createCampaign = (args) => {
  return account.createCampaign([Object.keys(Campaign.Fields)], args).then(res => res._data);
};

const updateCampaign = (args = {}) => {
  const { id, agentName } = args;
  return new Campaign(id).update([Campaign.Fields.name], {name: agentName})
    .then(res => {
      if (res.success !== true) return Promise.reject('Campaign was not update');
      return new Campaign(id).get([Campaign.Fields.name]).then(() => ({ agentName: agentName  }));
    });
};

const createAdSet = (args) => {
  const fields = [AdSet.Fields.start_time, AdSet.Fields.end_time, AdSet.Fields.daily_budget ];
  return account.createAdSet(fields, args).then(res => res._data);
};

const updateAdSet = (args = {}) => {
  const fields = [AdSet.Fields.name, AdSet.Fields.start_time, AdSet.Fields.end_time, AdSet.Fields.daily_budget ];
  const query = { ...args };
  if (args.agentName) query.name = args.agentName;
  if (args.budget) query.daily_budget = args.budget;
  if (args.address_string) {
    query.targeting = { 
      geo_locations: {
        ...adsManagerArgs.adSet.targeting.geo_locations,
        custom_locations: [{ ...adsManagerArgs.adSet.targeting.geo_locations.custom_locations[0], address_string: args.address_string }]
      } 
    };
  }
  return new AdSet(query.id).update([], query).then(async res => {
    if (res.success !== true) return Promise.reject('Adset was not update');
    const adSet = await new AdSet(query.id).get([fields]);
    return {
      agentName: adSet._data.name,
      startTime: adSet._data.start_time,
      endTime: adSet._data.end_time,
      budget: adSet._data.daily_budget
    };
  });
};

const createAdCreative = async (args = {}) => {
  if (args.image && !args.imageUrl) {
    const imageAsBase64 = await fs.readFile(args.image.path, 'base64');
    const adImage = await account.createAdImage([Object.keys(AdImage.Fields)], {bytes: imageAsBase64}, new AdImage(adAccountId));
    if (args.object_story_spec.link_data.picture) delete args.object_story_spec.link_data.picture;
    args.object_story_spec.link_data.image_hash = adImage._data.images.bytes.hash;
  };
  if (args.imageUrl) {
    if (args.object_story_spec.link_data.image_hash) delete args.object_story_spec.link_data.image_hash;
    args.object_story_spec.link_data.picture = args.imageUrl; 
  }
  return new AdCreative(null, args);
};

const updateAdCreative = async (args = {}) => {
  const oldCreative = await new AdCreative(args.creative_id).get(Object.keys(AdCreative.Fields));
  const query = { ...args  };
  delete query.id;
  delete query.creative_id;
  if (args.address_string) query.title = args.address_string;
  if (args.body) args.message = args.body;
  query.object_story_spec = {...oldCreative.object_story_spec};
  query.object_story_spec.link_data = Object.keys(query.object_story_spec.link_data).reduce((res, current) => {
    const prop = args[current] !== undefined && args[current] !== query.object_story_spec.link_data[current]
      ? args[current]
      : query.object_story_spec.link_data[current];
    return { ...res, [current]: prop };
  },{});
  const creative = await createAdCreative(query);
  return creative;
};

const createAd = async (args) => {
  const creative = await createAdCreative(args.creative);
  args.ad.creative = creative;
  const ad = await account.createAd(Object.keys(Ad.Fields), args.ad);
  const createdCreative = await new AdCreative(ad.creative.id).get(Object.keys(AdCreative.Fields));
  const result = { 
    id: ad.id,
    account_id: ad.account_id,
    campaign_id: ad.campaign_id,
    adset_id: ad.adset_id,
    creative_id: ad.creative.id,
    title: ad.name,
    body: args.retargeting ? '' : creative.object_story_spec.link_data.message,
    link: args.retargeting ? '' : creative.object_story_spec.link_data.link,
    status: ad.status,
    buttonType: args.retargeting ? creative._data.object_story_spec.template_data.call_to_action.type : '',
    image: args.creative.imageUrl ? args.creative.imageUrl : createdCreative.image_url
  };
  return result;
};

const updateAd = async (args = {}) => {
  const newCreative = await updateAdCreative(args);
  const query = { creative: newCreative };
  if (args.address_string) query.name = args.address_string;
  return new Ad(args.id).update([], query).then(async (res) => {
    if (res.success !== true) return Promise.reject('Ad was not update');
    await new AdCreative(args.creative_id).delete();
    const ad = await new Ad(args.id).get(Object.keys(Ad.Fields));
    const createdCreative = await new AdCreative(ad.creative.id).get(Object.keys(AdCreative.Fields));
    const result = {
      creative_id: ad.creative.id,
      title: ad.name,
      body: newCreative.object_story_spec.link_data.message,
      link: newCreative.object_story_spec.link_data.link,
      status: ad.status,
      image: args.imageUrl ? args.imageUrl : createdCreative.image_url
    };
    return result;
  });
};

module.exports.deleteAd = (args) => {
  return new Campaign(args.campaign_id).delete()
    .then(async (res) => {
      if (res.success) await new AdCreative(args.creative_id).delete();
      return res;
    });
};

module.exports.createComplexAd = async (args = {}) => {
  const { agentName, startTime, endTime, budget, link, body, image, imageUrl, buildingNumber, streetName, city, state, country, status } = args;
  const adTitle = `${buildingNumber} ${streetName} ${city} ${state} ${country}`;
  console.log(imageUrl)
  const campaign = await createCampaign({ ...adsManagerArgs.campaign, name: agentName, status });
  const adSet = await createAdSet({
    ...adsManagerArgs.adSet, 
    campaign_id: campaign.id, 
    name: agentName, 
    start_time: startTime,
    end_time: endTime, 
    daily_budget: budget,
    status,
    targeting: { 
      ...adsManagerArgs.adSet.targeting,
      geo_locations: {
        ...adsManagerArgs.adSet.targeting.geo_locations,
        custom_locations: [{ ...adsManagerArgs.adSet.targeting.geo_locations.custom_locations[0], address_string: adTitle }]
      } 
    }
  });
  const ad = await createAd({ 
    ad: {...adsManagerArgs.ad, adset_id: adSet.id, name: adTitle, status }, 
    creative: { 
      ...adsManagerArgs.adCreative,
      image: image,
      imageUrl: imageUrl,
      name: adTitle,
      object_story_spec: { 
        ...adsManagerArgs.adCreative.object_story_spec, 
        link_data: { ...adsManagerArgs.adCreative.object_story_spec.link_data, link: link, message: body }
      } 
    }
  });

  return {
    ...ad,
    budget: adSet.daily_budget,
    agentName: agentName,
    startTime: adSet.start_time,
    endTime: adSet.end_time,
    buildingNumber: buildingNumber,
    streetName: streetName,
    city: city,
    state: state,
    country: country,
  };
};

module.exports.updateAd = async (oldAd = {}, args = {}) => {
  const { id, campaign_id, adset_id, creative_id } = oldAd;
  const argsFields = Object.keys(args);
  const addressFields = ['buildingNumber', 'streetName', 'city', 'state', 'country'];
  let result = {};

  const getAddressString = () => {
    if (addressFields.filter(item => args[item]).length < 1) return;
    const address_string = addressFields.reduce((res, current) => {
      const item = args[current] !== undefined && args[current] !== oldAd[current] ? args[current] : oldAd[current];
      result[current] = item;
      return `${res} ${item}`;
    }, '');
    args.address_string = address_string.trim();
  };
  getAddressString();

  const fieldsPerRequest = {
    campaign: {
      fields: ['agentName'],
      action: (concurrence) => updateCampaign({ id: campaign_id, ...getQuery(concurrence, args) })
    },
    adSet: {
      fields: ['agentName', 'startTime', 'endTime', 'budget', 'address_string' ],
      action: (concurrence) => updateAdSet({ id: adset_id, ...getQuery(concurrence, args) })
    },
    ad : {
      fields: ['image', 'imageUrl', 'link', 'body', 'status', 'address_string'],
      action: (concurrence) => updateAd({ id: id, creative_id: creative_id, ...getQuery(concurrence, args) })
    } 
  };

  const apiRequests = () => {
    const apiRequests = Object.keys(fieldsPerRequest).map(apiItem => {
      const concurrence = argsFields.filter(item => fieldsPerRequest[apiItem].fields.includes(item));
      if (concurrence.length < 1) return;
      return fieldsPerRequest[apiItem].action(concurrence);
    });
    return Promise.all(apiRequests).then(res => res.reduce((res, current) => ({ ...res, ...current }), {}));
  };
  const updatedAd = await apiRequests();

  result = Object.keys(oldAd.toJSON()).reduce((res, current) => {
    if (args.address_string && addressFields.includes(current)) return res; 
    const prop = updatedAd[current] !== undefined && updatedAd[current] !== oldAd[current]
      ? updatedAd[current] 
      : oldAd[current];
    return { ...res, [current]: prop };
  }, {...result});

  return result;
};

/*
  RETARGETING ADS
*/

const createFeed = async (args = {}) => {
  const feed = await new ProductCatalog(args.catalog.id).createProductFeed([Object.keys(ProductFeed.Fields)], { name: 'tmp.csv' });
  testUrl = 'https://docs.google.com/spreadsheets/d/1rqLke28A-vETJW9VHTXPAt3US0fEW4aSFpvZQ7iTSU8/edit?usp=sharing'
  await feed.createUpload([Object.keys(ProductFeedUpload.Fields)], {url: /*args.url*/ testUrl});
  return feed._data;
};

module.exports.createRetargetingAd = async (args) => {
  const { agentName, budget, listings, startTime, endTime } = args;

  const url = await createCsv(listings);

  const locations = listings.map(item => {
    return { ...adsManagerArgs.adSet.targeting.geo_locations.custom_locations[0], latitude: item.lat, longitude: item.lng };
  });

  const catalog = await business.createOwnedProductCatalog([Campaign.Fields.name], { name: agentName, vertical: 'home_listings' });
  const feed = await createFeed({ catalog, url: url });
  const productSet = await new ProductCatalog(catalog.id).createProductSet([], {name: catalog.name});
  await catalog.createExternalEventSource([], { external_event_sources: [pixelId] });
    
  const campaign = await createCampaign({ 
    ...catalogArgs.campaign, 
    name: `RetargetingAd ${agentName}`,
    promoted_object: {'product_catalog_id': catalog._data.id} 
  });
  const adSet = await createAdSet({ 
    ...adsManagerArgs.adSet,  
    name: `RetargetingAd ${agentName}`,
    campaign_id: campaign.id, 
    promoted_object: {'product_set_id': productSet.id},
    daily_budget: budget,
    start_time: startTime,
    end_time: endTime, 
    targeting: { 
      ...adsManagerArgs.adSet.targeting,
      geo_locations: {
        custom_locations: locations
      } 
    }
  });
  const ad = await createAd({ 
    ad: { ...adsManagerArgs.ad, adset_id: adSet.id, name: `RetargetingAd ${agentName}'s listings` }, 
    creative: {
      ...catalogArgs.adCreative, 
      name: `RetargetingAd ${agentName}`,
      product_set_id: productSet.id
    },
    retargeting: true
  });

  return {
    ...ad,
    catalog_id: catalog._data.id,
    feed_id: feed.id,
    budget: adSet.daily_budget,
    agentName: agentName,
    listings: listings,
    startTime: adSet.start_time,
    endTime: adSet.end_time
  };
};

module.exports.updateRetargetingAd = async (oldAd = {}, args = {}) => {
  const { id, catalog_id, feed_id, campaign_id, adset_id, creative_id } = oldAd;
  const argsFields = Object.keys(args).map(item => item);
  let feedUrl;

  if (args.listings) feedUrl = await createCsv(args.listings);

  const fieldsPerRequest = {
    catalog: {
      fields: ['agentName'],
      action: () => new ProductCatalog(catalog_id).update([], { name: args.agentName || oldAd.agentName })
    },
    feed: {
      fields: ['listings'],
      action: () => new ProductFeed(feed_id).createUpload([], {url: feedUrl})
    },
    campaign: {
      fields: ['agentName'],
      action: () => new Campaign(campaign_id).update([], { name: `RetargetingAd ${args.agentName || oldAd.agentName}` })
    },
    adSet: {
      fields: ['agentName', 'startTime', 'endTime', 'budget'],
      action: (concurrence) =>  {
        const query = concurrence.reduce((res, current) => {
          let prop;
          if (current === 'startTime') prop = 'start_time';
          if (current === 'endTime') prop = 'end_time';
          if (current === 'budget') prop = 'daily_budget';
          return { ...res, [prop]: args[current] };
        } ,{});
        console.log(query);
        new AdSet(adset_id).update([], { ...query, name: `RetargetingAd ${args.agentName || oldAd.agentName}`});
      }
    },
    creative: {
      fields: ['listings'],
      action: () => new AdCreative(creative_id).update([], { name: (args.agentName || oldAd.agentName) })
    },
    ad : {
      fields: ['agentName', 'status'],
      action:  () => setTimeout(() => new Ad(id).update([], { 
        name: `RetargetingAd ${args.agentName || oldAd.agentName}'s listings`, 
        status: args.status || oldAd.status 
      }), 1000)
    }
  };

  const apiRequests = async () => {
    const apiRequests = Object.keys(fieldsPerRequest).map(apiItem => {
      const concurrence = argsFields.filter(item => fieldsPerRequest[apiItem].fields.includes(item));
      if (concurrence.length < 1) return;
      return fieldsPerRequest[apiItem].action(concurrence);
    });
    return Promise.all(apiRequests);
  };
  await apiRequests();

  return Object.keys(oldAd.toJSON()).reduce((res, current) => {
    const prop = args[current] !== undefined && args[current] !== oldAd[current] ? args[current] : oldAd[current];
    return { ...res, [current]: prop };
  }, {});
};

module.exports.deleteRetargetingAd = (args) => {
  return new ProductCatalog(args.catalog_id).delete().then(res => {
    if(res.success) return new Campaign(args.campaign_id).delete().then(res => {
      if(res.success) return new AdCreative(args.creative_id).delete().then(res => res);
    });
  });
};

/*
    INSIGHTS
*/

module.exports.getInsights = async () => {
  const insightsFields = [
    'ad_id',
    'impressions',
    'clicks',
    'spend',
    'date_start',
    'date_stop'
  ];
  const insightsParams = {
    time_increment: '1',
    filtering : [],
    level : 'ad'
  };

  const statTransform = (item) => {
    const { ad_id, impressions, clicks, spend, date_start, date_stop } = item._data;
    const [ year, month, day ] = date_start.split('-');
    return {
      ad_id, date_start, date_stop,
      impressions: Number(impressions),
      clicks: Number(clicks),
      spend: Number(spend), 
      day, month, year
    };
  };

  const insights = await account.getInsights(insightsFields, insightsParams).then(res => res.map(item => statTransform(item)));

  const from = new Date().setHours(0,0,0,0);
  const to = new Date().setHours(23,59,59,999);

  await Stats.bulkWrite(
    insights.map((item) => 
      ({
        updateOne: {
          filter: { date_start: item.date_start, createdAt: {$gte: from, $lt: to}, ad_id: item.ad_id },
          update: { $set: item },
          upsert: true
        }
      }))
  ).then(res => res);

  setTimeout(() => this.getInsights(), 3600000);
};

this.getInsights();

