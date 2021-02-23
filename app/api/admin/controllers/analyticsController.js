const CommonService = require('../services/commonService')
const UserService = require('../services/userService')
const util = require('../../../utils/utils')
const config = require('../../../config/index')
// const UniversityTrending = require('../../../models/universityTrending')
const UserPost = require('../../../models/userPost')
const AnalyticsSchema = require('../schemaValidator/analyticsSchema')
const Sequelize = require('sequelize')
// const { number } = require('@hapi/joi')

const commonService = new CommonService()
const userService = new UserService()

class AnalyticsController {
  async getStreamsTotally (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    let streamCount
    console.log(req.query)
    try {
      const validationResult = await AnalyticsSchema.getStream.validateAsync(req.query)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      } if (req.query.university_id >= 1) {
        //  console.log('wwwwwwwwwwwwwwwwwwwwwwwwwwww')
        streamCount = await userService.getSharesPerUniversity(req.query.media_id, req.query.university_id)
        console.log('unviersity wise', streamCount.count)
      } else {
        streamCount = await commonService.findAndCountAll(UserPost, { media_id: req.query.media_id, media_type: 1 })
        console.log('Whole wise', streamCount.count)
      }
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, streamCount.count)
      // }
      /* else {
        const streamCount1 = await commonService.findOne(UniversityTrending, { university_id: req.query.university_id, media_id: req.query.media_id, media_type: req.query.media_type }, ['count'])
        console.log('unviersity wise', streamCount1)
        util.successResponse(res, config.constants.SUCCESS, langMsg.success, streamCount1)
      } */
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

/*  async getStreamsMonthly (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    let streamCount
    console.log(req.query)
    try {
      const validationResult = await AnalyticsSchema.getStreamMonthly.validateAsync(req.query)
      if (validationResult.error) {
        // util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      } if (req.query.university_id >= 1) {
        //  console.log('wwwwwwwwwwwwwwwwwwwwwwwwwwww')
        streamCount = await userService.getSharesPerUniversity(req.query.media_id, req.query.university_id)
        console.log('unviersity wise', streamCount.count)
      } else {
        streamCount = await userService.getTotalMonthlyShares(req.query.media_id, req.query.month)
        console.log('Whole wise', streamCount.count)
      }
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, streamCount.count)
      // }
      /* else {
        const streamCount1 = await commonService.findOne(UniversityTrending, { university_id: req.query.university_id, media_id: req.query.media_id, media_type: req.query.media_type }, ['count'])
        console.log('unviersity wise', streamCount1)
        util.successResponse(res, config.constants.SUCCESS, langMsg.success, streamCount1)
      }
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  } */
}

module.exports = AnalyticsController
