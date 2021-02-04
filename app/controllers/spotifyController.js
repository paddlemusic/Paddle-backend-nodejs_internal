const util = require('../utils/utils')
const CommonService = require('../services/commonService')
const commonService = new CommonService()
const config = require('../config/index')
const schema = require('../middleware/schemaValidator/spotifySchema')
const UserState = require('../models/userState')
const https = require('https')
// const UserRating = require('../models/userRating')

class SpotifyController {
  async saveSpotifyState (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await schema.saveState.validateAsync(req.query)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      validationResult.user_id = req.decoded.id
      const param = { user_id: req.decoded.id, isSpotifyConnected: validationResult.connect }
      const data = await commonService.createOrUpdate(UserState, param)
      delete data[0].user_id
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, data[0])
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async refreshToken (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const AUTH_HEADER = 'Basic ' +
                  Buffer.from(`${config.constants.SPOTIFY.CLIENT_ID}:${config.constants.SPOTIFY.CLIENT_SECRET}`).toString('base64')
      console.log(AUTH_HEADER)
      console.log(config.constants.SPOTIFY.CLIENT_ID)
      console.log(config.constants.SPOTIFY.CLIENT_SECRET)
      const data = JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: req.body.refresh_token
      })
      console.log(data)
      const options = {
        hostname: config.constants.SPOTIFY.URI,
        port: 443,
        path: `/api/token?grant_type=refresh_token&refresh_token=${req.body.refresh_token}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: AUTH_HEADER
        }
      }
      console.log(options)
      const request = https.request(options, response => {
        console.log(`statusCode: ${res.statusCode}`)

        response.on('data', d => {
          process.stdout.write(d)
        })
      })
      request.on('error', error => {
        console.error(error)
      })

      // request.write(data)
      request.end()

      util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }
}
module.exports = SpotifyController
