const CustomError = require('../../../utils/customError')

class CommonService {
  create (table, params) {
    return new Promise((resolve, reject) => {
      table.create(params)
        .then(result => resolve(result))
        //.catch(err => reject(err))
        .catch(err => {
          if (err.original && (err.original.code === '23505' || err.original.code === 23505)) {
            switch (err.errors[0].path) {
              case 'name':
                reject(new CustomError('University Name and City must be unique.'))
                break
              case 'city':
                reject(new CustomError('University Name and City must be unique.'))
                break
              default:
                reject(err)
            }
          } else {
            console.log(err)
            reject(err)
          }
        })
    })
  }

  update (table, params, condition, returning = false) {
    console.log('IN UPDATE:')
    return new Promise((resolve, reject) => {
      table.update(params, { where: condition, returning: returning })
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  findOne (table, condition, attributes) {
    return new Promise((resolve, reject) => {
      table.findOne({ where: condition, attributes: attributes, raw: true })
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  findAll (table, condition, attributes) {
    return new Promise((resolve, reject) => {
      table.findAll({ where: condition, raw: true, attributes: attributes })
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  findAndCountAll (table, condition, attributes) {
    return new Promise((resolve, reject) => {
      table.findAndCountAll({ where: condition, attributes: attributes })
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  delete (table, condition) {
    return new Promise((resolve, reject) => {
      table.destroy({ where: condition })
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
      }).then(result => resolve(result))
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
        }).then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  getPagination (page, pageSize) {
    const limit = pageSize ? +pageSize : null
    const offset = page ? page * pageSize : 0
    return { limit, offset }
  }

  bulkCreate (table, params) {
    return new Promise((resolve, reject) => {
      table.bulkCreate(params, { ignoreDuplicates: true })
        .then(result => resolve(result))
        .catch(err => {
          (err.original.code === '23505' || err.original.code === '23503')
            ? resolve(err)
            : reject(err)
        })
    })
  }

  createOrUpdate (table, params) {
    return new Promise((resolve, reject) => {
      table.upsert(params, { returning: false })
        .then(result => resolve(result))
        .catch(err => reject(err))
    })
  }
}

module.exports = CommonService
