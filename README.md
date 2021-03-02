# Prepr SDK for Nuxt.js

This is the official Prepr SDK for Node.js. It provided a standardized way for your team to communicate with the Prepr REST API.

## Getting started

### Installation

Get started by installing the SDK in your application, simply open a terminal and enter

```bash
npm i @preprio/nodejs-sdk
```

### Creating a client

We don't want to repeat our configuration for every api call, that's why we suggest you create a client from which you make requests. Let's make a client by creating `services/prepr.js` with the following code

```js
// services/prepr.js

const { createPreprClient } = require('@preprio/nodejs-sdk')

const prepr = createPreprClient({
  token: '<your access token>', // required
  timeout: 4000, // default value
  baseUrl: 'https://cdn.prepr.io', // default value
  userId: null, // optional, used for AB testing
})

module.exports = { prepr }
```

Great, now we have the configuration in one place. Now, we can import our configured prepr client to perform requests.

## Usage

To perform API requests you can make use of our fluent builder, this is how it looks like

```js
// We created this earlier
const { prepr } = require('./services/prepr')

const publications = await prepr
  .path('/publications') // request path `https://cdn.prepr.io/publications`
  .query('...') // query data https://prepr.dev/docs/rest/v1/introduction
  .timeout(8000) // Override globally set timeout for request cancellation
  .userId('...') // Override globally set userId for ab testing
  .sort('created_at') // Sort data
  .limit(8) // Limit the amount collections being returned
  .fetch() // Fetch the collections
```
