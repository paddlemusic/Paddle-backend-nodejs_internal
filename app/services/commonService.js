const User = require('../models/user')

class CommonService {
  create (table, params) {
    return new Promise((resolve, reject) => {
      table.create(params)
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  update (table, params, condition) {
    console.log('IN UPDATE:')
    return new Promise((resolve, reject) => {
      table.update(params, { where: condition, returning: false })
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  findOne (table, condition, attributes) {
    return new Promise((resolve, reject) => {
      table.findOne({ where: condition, raw: true, attributes: attributes })
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  findOrCreate (table, condition, attributes) {
    return new Promise((resolve, reject) => {
      table.findOrCreate({
        where: condition,
        raw: true,
        defaults: attributes
      })
        .then(result => {
          return resolve(result)
        })
        .catch(err => reject(err))
    })
  }

  upsert (table, params, condition) {
    return new Promise((resolve, reject) => {
      table.findOne({ where: condition, raw: true })
        .then(result => {
          if (result) {
            return this.update(table, params, condition)
          }
          return this.create(table, params)
        }).then(result => {
          return resolve(result)
        })
        .catch(err => reject(err))
    })
  }
}

module.exports = CommonService
