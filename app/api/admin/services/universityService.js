const University = require('../../../models/university')
const UniversityDomain = require('../../../models/universityDomain')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

class UniversityService {
  getUniversities (name, pagination) {
    return new Promise((resolve, reject) => {
      University.findAndCountAll({
        where: {
          name: {
            [Op.iLike]: '%' + name + '%'
          }
        },
        limit: pagination.limit,
        offset: pagination.offset,
        attributes: ['id', 'name', 'city', 'is_active', 'created_at', 'updated_at'],
        order: [['id', 'ASC']],
        raw: true
      }).then(result => resolve(result))
        .catch(err => reject(err))
    })
  }

  searchUniversity (name, pagination) {
    return new Promise((resolve, reject) => {
      University.findAndCountAll({
        where: {
          name: {
            [Op.iLike]: '%' + name + '%'
          }
        },
        limit: pagination.limit,
        offset: pagination.offset,
        attributes: ['id', 'name', 'city', 'is_active', 'created_at', 'updated_at'],
        // group: ['id'],
        order: [['id', 'ASC']],
        raw: true
      }).then(result => resolve(result))
        .catch(err => reject(err))
    })
  }
  getDomainData () {
    return new Promise((resolve, reject) => {
      UniversityDomain.findAndCountAll({
        raw: true
      }).then(result => resolve(result))
        .catch(err => reject(err))
    })
  }
}
module.exports = UniversityService
