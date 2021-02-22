const fetch = require('node-fetch')
const AbortController = require('abort-controller')
const murmurhash = require('murmurhash')

const createPreprClient = options => new PreprClient(options)

class PreprClient {
  constructor({
    token = null,
    baseUrl = 'https://cdn.prepr.io',
    timeout = 4000,
    userId = null,
  }) {
    this._token = token
    this._baseUrl = baseUrl
    this._timeout = timeout

    userId && this._hashUserId(userId)
  }

  _abTestingValue = null
  _hasAbTesting = false

  _hashUserId(userId) {
    const hashValue = murmurhash.v3(userId, 1)
    const ratio = hashValue / Math.pow(2, 32)

    this._userId = parseInt(ratio * 10000)
    this._hasAbTesting = true
  }

  _queryStringBuilder({ query, sort, limit }) {
    const queryString = new URLSearchParams()

    if (query) {
      queryString.append('fields', query.replace(/\s/g, ''))
    }

    if (sort) {
      queryString.append('sort', sort)
    }

    if (limit) {
      queryString.append('limit', limit)
    }

    return queryString.toString()
  }

  userId(userId) {
    this._hashUserId(userId)

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

  path(path) {
    this._path = path

    return this
  }

  async fetch(options = {}) {
    const controller = new AbortController()

    const fetchTimeout = setTimeout(() => controller.abort(), this._timeout)

    const hasQueryString = this._queryStringBuilder({
      query: this._query,
      sort: this._sort,
      limit: this._limit,
    })

    const requestString = `${this._baseUrl}${this._path}?${hasQueryString}`

    const abTestingHeaders = this._hasAbTesting && {
      'Prepr-ABTesting': this._userId,
    }

    const requestOptions = {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        ...abTestingHeaders,
        Authorization: `Bearer ${this._token}`,
      },
    }

    try {
      const response = await fetch(requestString, requestOptions)

      const data = await response.json()

      return data
    } catch (error) {
      throw new Error(error)
    } finally {
      clearTimeout(fetchTimeout)
    }
  }
}

module.exports = { createPreprClient }