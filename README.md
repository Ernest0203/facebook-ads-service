# Ad Service

## Install

```bash
npm install
```

## Start Dev

```bash
npm run dev
```

## Start (need prod config)

```bash
npm start
```

## Overview

This app is for managing ads on facebook.
For correct work it is required [Business manager](https://business.facebook.com/) and active app, connected to business account in [Developers manager](https://developers.facebook.com/). In devs manager also needed to switch app in live mode.
In [API Explorer](https://developers.facebook.com/tools/explorer/) needed to generate access token with all required permissions.
Also needed [Ads manager account id](https://business.facebook.com/adsmanager), facebook page id (3dlisting page for example), [pixel id](https://business.facebook.com/events_manager2/list/pixel), and business id from link above. All this stuff put in config file.

config file:
```bash
  "facebook": {
    "accessToken": "EAAF00qRlumwBAATncNH8coTNASvqjtaZCUQ5yqLZAAm7a5QIs8IUd4VkAPgdgBsb84zpMeSoNIeg00d0SqKt8laZC1acJERlfhHjQyqF8wDjTmD17R7oZBqn0q2UhF9ssYaVgQSeKZAZBYt58f7AeoonqevEtzhZAPZCGJP9ZB23URgZDZD",  //  take from Api Explorer
    "adAccountId": "411847933496802",   // take from url page of ads manager, or in accounts switcher
    "pageId": "101722741834494",        // take from url of facebook compane page
    "businessId": "214639823500022",    // take from url page of business manager 
    "pixelId": "1186661128823179"       // take in events manager after creating a pixel
  },
```

## Authorization
Method locale in /routes/index.js, commented by default, until you have the right key.
Auth check requests headers for token generated by 'secret' specified in config.

## Methods
All non variables arguments for create and update ads are in api module.
For creating retargeting ads feed file for catalog generate from array "listings" and save in folder resources (if folder does not create, create it manually), then generate static link to it and put to feed upload argument.
Images also save in resources folder.
Get stats method call per hour and update or create new stat instanses in db. Located in /api/facebook.js line 530, commented, until you dont have ads and stats models.

Result of running methods is data or error

### Methods for simple ads
```bash
GET /ads/           get ads     // retrun array of objects
   Filter arguments put inside arguments object: 
      { agentName: 'Daniel', budget: '200', sort: '-propName' or 'propName', limit: 10, skip: 10 } 
      
GET /ads/:id        get single ad   // return object
    id = mongo _id
    
POST /ads/          create ad       // return object
     Variable arguments for creating:
        args: {
            agentName: 'Melisa',
            buildingNumber: '1',
            streetName: 'Cottage Street',
            city: 'Boston',
            state: 'MA',
            country: 'US',
            budget: '100',  // cents
            link: 'https://listing3d.com/67-cottage-street-jeffries-point-boston-ma/sYQAAB_YAAAL8',
            img: input type='file' append to form data  // non required
            body: '1 Bedroom, 1 Bathroom, 558 Sq.feet', // non required  // some description
            startTime: '2021-01-20T13:23:34+0200',      // non required
            endTime: '2021-01-25T00:00:00+0200',        // non required
            status: 'PAUSED'                            // non required
        }

POST /ads/:id       update ad       // return object
    id = mongo _id, { ...args }
    
DELETE /ads/:id     delete ad       // return _id of object marked deleted
    id = mongo _id
    
GET /ads/stats      get stats for simple ads  // return array of stat objects for simple ads
    args: {
        from,  // start date
        to,    // end date
        isSum,    // sum all stats in one object
        group,    // 'day' (default) or 'month'
        isIgnoreRemoved, // false (default)
        filter: { propName: propValue, limit, skip }
    }
```

### Methods for retargeting ads
```bash
GET /retargeting-ads/           get ads     // return array of objects
    Filter arguments put inside arguments object: 
      { agentName: 'Daniel', budget: '200', sort: '-propName' or 'propName', limit: 10, skip: 10 }
      
GET /retargeting-ads/:id        get single ad       // return object
    id = mongo _id
    
POST /retargeting-ads/          create ad       return object
    args: {
        agentName,
        budget: '500',     // min for retargeting ads
        listings: [{}]     // array of property objects, feed file for catalog generate and save in folder resorces,
            then generate static link to it and put to feed upload argument
        startTime:            // non required
        endTime:              // non required
        status: 'PAUSED',     // non required
    }
    
POST /retargeting-ads/:id       update ad       // return object 
    id = mongo _id, { ...args }
    
DELETE /retargeting-ads/:id     delete ad   // return _id of object marked deleted
    id = mongo _id
    
GET /retargeting-ads/stats      get stats for retargeting ads   //  return array of stat objects for retargeting ads
    args: {
        from,  // start date
        to,    // end date
        isSum,    // sum all stats in one object
        group,    // 'day' (default) or 'month'
        isIgnoreRemoved, // false (default)
        filter: { propName: propValue, limit, skip }
    }
```