# Node.js Prepr Content Delivery SDK

- [Source code](https://github.com/preprio/nodejs-sdk) on GitHub.

## About Prepr

Hi there, nice to meet you. We are Prepr, and we are the world’s first data-driven headless content management system. With just one solution, we offer you all the tools you need to publish impactful content.

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
  baseUrl: 'https://graphql.prepr.io/graphql', // default value (GraphQL API), for the REST API use https://cdn.prepr.io/
  customerId: null, // optional, used for AB testing and personalization
})

module.exports = { prepr }
```

Great, now we have the configuration in one place. Now, we can import our configured prepr client to perform requests.

## Usage GraphQL API

To perform API requests you can make use of our fluent builder, this is how it looks like

```js
// We created this earlier
const { prepr } = require('./services/prepr')

const result = await prepr
  .graphqlQuery(`GraphQL Query`) // https://docs.prepr.io/reference/graphql/v1/fetching-collections
  .graphqlVariables({ JSON_VARIABLE_PAYLOAD })
  .timeout(8000) // Override globally set timeout for request cancellation
  .customerId('...') // Override globally set userId for ab testing or personalization
  .token('xx-xx') // Update the Token used by the SDK for example when previewing staged content
  .fetch() // Fetch the collections
```

Let's request all Pages in our Prepr environment.

```js
// We created this earlier
const { prepr } = require('./services/prepr')

const result = await prepr
  .graphqlQuery(
    `{
        Pages {
            items {
                _id
                title
                summary
            }
        }
    }`,
  )
  .fetch()
```

To help you querying our API we've added multiple examples to our [GraphQL Reference](https://docs.prepr.io/reference/graphql/v1/fetching-collections).

## Usage REST API

To perform API requests you can make use of our fluent builder, this is how it looks like

```js
// We created this earlier
const { prepr } = require('./services/prepr')

const result = await prepr
  .path('/publications') // request path `https://cdn.prepr.io/publications`
  .query({
    model: {
      eq: 'x-x-x-x-x',
    },
  }) // query data https://docs.prepr.io/reference/rest/v1/introduction
  .timeout(4000) // Override globally set timeout for request cancellation
  .customerId('...') // Override globally set customerID for ab testing and personalization
  .token('xx-xx') // Update the Token used by the SDK for example when previewing staged content
  .sort('created_at') // Sort data
  .limit(8) // Limit the amount collections being returned
  .skip(0) // Skip the first x amount collections before returning resources
  .fetch() // Fetch the collections
```

To help you to query our API we've added multiple examples to our [REST Reference](https://docs.prepr.io/reference/rest/v1/introduction).

## Reach out to us

You have questions about how to use this library or the Prepr API?
Contact our support team at support@prepr.io or join us on [Slack](https://slack.prepr.io).

**You found a bug or want to propose a feature?**.
File an issue here on GitHub. Don't share any authentication info in any code before sharing it.
