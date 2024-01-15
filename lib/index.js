const fetch = require('node-fetch')
const AbortController = require('abort-controller')
const murmurhash = require('murmurhash')
const qs = require('qs')

const createPreprClient = options => new PreprClient(options)

class PreprClient {
  constructor({
    token = null,
    baseUrl = 'https://cdn.prepr.io',
    timeout = 4000,
    userId = null,
    customerId = null,
  }) {
    this._token = token
    this._baseUrl = baseUrl
    this._timeout = timeout
    this._path = null
    this._hasAbTesting = false
    this._customerId = customerId

    userId && this._hashUserId(userId)
  }

  userId(userId) {
    this._hashUserId(userId)

    return this
  }

  customerId(customerId) {
    this._customerId = customerId

    return this
  }

  timeout(milliseconds) {
    this._timeout = milliseconds

    return this
  }

  query(query) {
    this._query = query

    return this
  }

  sort(field) {
    this._sort = field

    return this
  }

  limit(limit) {
    this._limit = limit

    return this
  }

  skip(skip) {
    this._skip = skip

    return this
  }

  path(path) {
    this._path = path

    return this
  }

  token(token) {
    this._token = token

    return this
  }

  graphqlQuery(graphQLQuery) {
    this._graphQLQuery = graphQLQuery

    return this
  }

  graphqlVariables(graphQLVariable) {
    this._graphQLVariable = graphQLVariable

    return this
  }

  async fetch(options = {}) {
    const controller = new AbortController()

    const fetchTimeout = setTimeout(() => controller.abort(), this._timeout)

    const hasQueryString = this._queryStringBuilder({
      query: this._query,
      sort: this._sort,
      limit: this._limit,
      skip: this._skip,
    })

    const requestString = `${this._baseUrl}${
      this._path || ''
    }?${hasQueryString}`

    const headers = {
      Authorization: `Bearer ${this._token}`,
    }

    Object.assign(headers, options.headers)

    if (this._hasAbTesting) {
      Object.assign(headers, {
        'Prepr-ABTesting': this._userId,
      })
    }

    if (this._customerId) {
      Object.assign(headers, {
        'Prepr-Customer-Id': this._customerId,
      })
    }

    const requestOptions = {
      signal: controller.signal,
      headers,
    }

    if (this._graphQLQuery) {
      Object.assign(headers, {
        'Content-Type': 'application/json',
      })

      const query = this._graphQLQuery
      const variables = this._graphQLVariable

      requestOptions.method = 'POST'
      requestOptions.body = JSON.stringify({
        query,
        variables,
      })
    }

    delete options.headers
    Object.assign(requestOptions, options)

    try {
      const response = await fetch(requestString, requestOptions)

      const data = await response.json()

      return data
    } catch (error) {
      throw new Error(error)
    } finally {
      clearTimeout(fetchTimeout)

      this._query = null
      this._limit = null
      this._skip = null
      this._path = null
      this._sort = null
      this._graphQLQuery = null
      this._graphQLVariable = null
    }
  }

  _hashUserId(userId) {
    const hashValue = murmurhash.v3(userId, 1)
    const ratio = hashValue / Math.pow(2, 32)

    this._userId = parseInt(ratio * 10000)
    this._hasAbTesting = true
  }

  _queryStringBuilder({ query, sort, limit, skip }) {
    if (!query) {
      query = []
    }

    if (sort) {
      query['sort'] = sort
    }

    if (limit) {
      query['limit'] = limit
    }

    if (skip) {
      query['skip'] = skip
    }

    return qs.stringify(query)
  }
}

module.exports = { createPreprClient }
