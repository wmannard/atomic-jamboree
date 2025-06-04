# qa-atomic

A sample project for testing and validating the commerce use case in @coveo/atomic

## Start

```sh
cp .env.example .env
npm install
npm run dev
```

Windows:

```bat
copy .env.example .env
npm install
npm run dev
```

## Change the engine config

Configure the orgId and other variables in you local `.env` file . They will be used here: [engine.js](https://github.com/coveo/qa-atomic/blob/main/engine.js)

## Change the listing pages views

Configure the listing pages urls in [navbar.js](https://github.com/coveo/qa-atomic/blob/main/navbar.js)

## Change the recommendations

Change the slot-id in `atomic-commerce-recommendation-list` like [this](https://github.com/coveo/qa-atomic/blob/5ce28a15e2c6816e563f42c53b9d2ebd6117d2d8/recs1/index.html#L39).

## Steps to set up a catalog source and commerce pages

### 1. [Add a catalog source](https://docs.coveo.com/en/n8of0593/coveo-for-commerce/add-a-catalog-source)

### 2. [Add the necessary fields](https://docs.coveo.com/en/n73f0502/coveo-for-commerce/commerce-fields)

### 3. [Map the commerce fields](https://docs.coveo.com/en/n8of7021/coveo-for-commerce/map-commerce-fields#with-a-catalog-source)

### 4. [Create a catalog and include the configs for products, variant and availabilities](https://docs.coveo.com/en/3139/coveo-for-commerce/commerce-catalog)

### 5. Create a trackingId

This can only be done with an [internal API](https://platform.cloud.coveo.com/docs/internal?urls.primaryName=Commerce#/Tracking%20ID%20to%20Catalog%20Mappings) using the VPN or while in office.

### 6. [Create storefront associations](https://docs.coveo.com/en/o48e0216/coveo-for-commerce/storefront-associations)

### 7. [Stream the catalog data into your source](https://docs.coveo.com/en/lb4a0344/coveo-for-commerce/stream-your-catalog-data-to-your-source)

I recommend using [pushapi-nodejs](https://github.com/coveooss/pushapi-nodejs) for simple streaming of the catalog.

### 8. Create your different page configurations in the merchandising hub

- [listing pages](https://docs.coveo.com/en/o78c0306/coveo-for-commerce/create-listing-configurations#manage-listing-pages-using-the-coveo-merchandising-hub)
- [search pages](https://docs.coveo.com/en/o7mc0039/coveo-for-commerce/create-search-configurations#manage-search-pages-using-the-coveo-merchandising-hub)
- [recommendations](https://docs.coveo.com/en/o8880463/coveo-for-commerce/create-recommendation-configurations)
