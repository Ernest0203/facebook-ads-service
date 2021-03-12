const { writeToPath } = require('fast-csv');
const path = require('path');
const config = require('config');

const HOST = config.get('server.host');
const PORT = config.get('server.port');

const createCsv = (args) => new Promise((resolve, reject) => {
  const originalHeaders = {
    wlId: 'home_listing_id',
    title: 'name',
    saleType: 'availability',
    streetName: 'address.addr1',
    city: 'address.city',
    state: 'address.region',
    country: 'address.country',
    zip: 'address.postal',
    lat: 'latitude',
    lng: 'longitude',
    neighborhood: 'neighborhood[0]',
    imageSrc: 'image[0].url',
    imageSrc: 'image[0].url',
    link: 'url',
    beds: 'num_beds',
    baths: 'num_baths',
  }
  
  const headers = Object.keys(args[0]).map(item => {
    return originalHeaders[item] ? originalHeaders[item] : item;
  }).concat(['address.country']);

  const rows = args.map(item => {
    return Object.keys(item).map(prop => {
      if (prop === 'price') return `${item[prop]} USD`;
      if (prop === 'saleType') return `for_${item[prop]}`;
      if (prop === 'streetName') return `${item.buildingNumber} ${item.streetName}`;
      return item[prop];
    }).concat(['United States']);
  });

  const result = [ headers, ...rows ]

  writeToPath(path.resolve(__dirname, '../../resources/tmp.csv'), result)
    .on('error', err => reject(err))
    .on('finish', () => resolve(`http://${HOST}:${PORT}/resources/tmp.csv`));
});

module.exports = createCsv;