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
    this._abTestingValue = null
    this._hasAbTesting = false

    userId && this._hashUserId(userId)
  }

  _hashUserId(userId) {
    const hashValue = murmurhash.v3(userId, 1)
    const ratio = hashValue / Math.pow(2, 32)

    this._userId = parseInt(ratio * 10000)
    this._hasAbTesting = true
  }

  _queryStringBuilder({ query, sort, limit, fields }) {

    const queryString = new URLSearchParams(this._formurlencoded(query))

    if (sort) {
      queryString.append('sort', sort)
    }

    if (limit) {
      queryString.append('limit', limit)
    }

    if (fields) {
      queryString.append('fields', fields)
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

  fields(fields) {
    this._fields = fields.join(',')

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
      fields: this._fields
    })

    const requestString = `${this._baseUrl}${this._path}?${hasQueryString}`

    const headers = {
      Authorization: `Bearer ${this._token}`,
    }

    Object.assign(headers, options.headers)

    if (this._hasAbTesting) {
      Object.assign(headers, {
        'Prepr-ABTesting': this._userId,
      })
    }

    const requestOptions = {
      signal: controller.signal,
      headers,
    }

    Object.assign(requestOptions, options)

    console.log('[DEBUG] ' + requestString)

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
   
  _formurlencoded(data) {
    const opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    let sorted = Boolean(opts.sorted),
        skipIndex = Boolean(opts.skipIndex),
        ignorenull = Boolean(opts.ignorenull),
        encode = function encode(value) {
          return String(value).replace(/(?:[\0-\x1F"-&\+-\}\x7F-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g, encodeURIComponent).replace(/ /g, '+').replace(/[!'()~\*]/g, function (ch) {
            return '%' + ch.charCodeAt().toString(16).slice(-2).toUpperCase();
          });
        },
        keys = function keys(obj) {
          const keyarr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Object.keys(obj);
          return sorted ? keyarr.sort() : keyarr;
        },
        filterjoin = function filterjoin(arr) {
          return arr.filter(function (e) {
            return e;
          }).join('&');
        },
        objnest = function objnest(name, obj) {
          return filterjoin(keys(obj).map(function (key) {
            return nest(name + '[' + key + ']', obj[key]);
          }));
        },
        arrnest = function arrnest(name, arr) {
          return arr.length ? filterjoin(arr.map(function (elem, index) {
            return skipIndex ? nest(name + '[]', elem) : nest(name + '[' + index + ']', elem);
          })) : encode(name + '[]');
        },
        nest = function nest(name, value) {
          const type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : typeof value === 'undefined' ? 'undefined' : typeof (value);
          let f = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

          if (value === f) f = ignorenull ? f : encode(name) + '=' + f; else if (/string|number|boolean/.test(type)) f = encode(name) + '=' + encode(value); else if (Array.isArray(value)) f = arrnest(name, value); else if (type === 'object') f = objnest(name, value);

          return f;
        };

    return data && filterjoin(keys(data).map(function (key) {
      return nest(key, data[key]);
    }));
  }
}

module.exports = { createPreprClient }
