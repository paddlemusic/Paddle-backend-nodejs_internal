const schema = require('../middleware/schemaValidator/userRefSchema')
const userSchema = require('../middleware/schemaValidator/userSchema')
const util = require('../utils/utils')
const CommonService = require('../services/commonService')
const commonService = new CommonService()
// const notificationService = require('../services/notificationService')
const ProfileService = require('../services/profileService')
const profileService = new ProfileService()
const UserService = require('../services/userService')
const userService = new UserService()
const UserPlaylist = require('../models/userPlaylist')
const PlaylistTrack = require('../models/playlistTrack')
const LikeUnlike = require('../models/likePost')
const User = require('../models/user')
const UserFollower = require('../models/userFollower')

const s3Bucket = require('../services/s3Bucket')

const config = require('../config/index')
const UserShare = require('../models/userPost')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const UserMedia = require('../models/userMedia')

class ProfileController {
  /* Playlist Methods
      - Create Playlist
      - Update Playlist
      - Delete Playlist
      - Get Playlist
      - Add tracks to playlist
      - Remove tracks from playlist
      - Get playlist tracks
  */
  async createPlaylist (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await userSchema.playlist.validateAsync(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      req.body.user_id = req.decoded.id
      const playlistData = await commonService.create(UserPlaylist, req.body)
      console.log(playlistData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async updatePlaylist (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await userSchema.playlist.validateAsync(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      const condition = { id: req.params.playlist_id, user_id: req.decoded.id }
      const playlistData = await commonService.update(UserPlaylist, req.body, condition)
      console.log(playlistData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async deletePlaylist (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await userSchema.deletePlaylist.validateAsync(req.params)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      const condition = { id: req.params.playlist_id, user_id: req.decoded.id }
      const playlistData = await commonService.delete(UserPlaylist, condition)
      console.log(playlistData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getPlaylist (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const condition = { user_id: req.decoded.id }
      const playlistData = await commonService.findAndCountAll(UserPlaylist, condition,
        ['id', 'name', 'description', 'createdAt', 'updatedAt'])
      console.log(playlistData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, playlistData)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async addTracks (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await userSchema.tracks.validateAsync(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      const params = []
      req.body.track_ids.forEach(trackId => {
        params.push({ playlist_id: req.params.playlist_id, track_id: trackId })
      })
      console.log(params)
      const playlistData = await commonService.bulkCreate(PlaylistTrack, params)
      console.log(playlistData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async userShare (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    userSchema.userShare.validateAsync(req.body).then(async () => {
      try {
        const validationResult = await userSchema.userShare.validate(req.body)
        if (validationResult.error) {
          util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
          return
        }
        if (Number(req.decoded.id) === Number(req.body.shared_with)) {
          util.failureResponse(res, config.constants.CONFLICT, langMsg.conflict)
          return
        }
        const params = {
          user_id: req.decoded.id,
          media_id: req.body.media_id,
          caption: req.body.caption,
          shared_with: req.body.shared_with,
          media_image: req.body.media_image,
          media_name: req.body.media_name,
          meta_data: req.body.meta_data,
          media_type: req.params.media_type
        }
        console.log('params are:', params)
        await commonService.create(UserShare, params)
        // push notification section
        /*        const followerName = await commonService.findOne(User, { id: req.decoded.id }, ['name'])
        const payload = {
          message: {
            notification: {
              title: 'Paddle Notification ',
              body: followerName.dataValues.name + ' ' + ' shared a post with you'
            }
          }
        }
        if (req.body.shared_with === null) {
          const followingData = await userService.getFollowing(req.decoded)
          const followingToken = followingData.rows.map(follower => { return follower.device_token })
          await notificationService.sendNotification(followingToken, payload)
        } else {
          const sharedwithToken = await commonService.findAll(User, { id: req.body.shared_with }, ['device_token'])
          await notificationService.sendNotification(sharedwithToken, payload)
        } */
        util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
      } catch (err) {
        console.log(err)
        util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
      }
    })
  }

  async getUserShareAsPost (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      // const validationResult = await schema.follow.validate(req.params)
      // if (validationResult.error) {
      //   util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
      //   return
      // }
      const pagination = commonService.getPagination(req.query.page, req.query.pageSize)
      const myfollowingData = await userService.getUserFollowing(req.decoded)
      const myfollowingIDs = myfollowingData.map(data => { return data.user_id })
      const postData = await userService.getUserPost(myfollowingIDs, req.decoded.id, pagination)
      console.log('MyFollower:', postData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, postData)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async deleteTracks (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await userSchema.tracks.validateAsync(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      const condition = { track_id: req.body.track_ids }
      const playlistData = await commonService.delete(PlaylistTrack, condition)
      console.log(playlistData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getUserShareAsFriend (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await userSchema.friend.validate(req.params)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      const myfollowingData = await userService.getUserFollowing(req.decoded)
      const myfollowingIDs = myfollowingData.map(data => { return data.user_id })
      const sharedWith = req.params.shared_with
      const postData = await userService.getUserSharedAsFriendPost(myfollowingIDs, sharedWith)
      console.log('MyFollower:', postData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, postData)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getPlaylistTracks (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const condition = { user_id: req.decoded.id, id: req.params.playlist_id }
      const playlistData = await commonService.findOne(UserPlaylist, condition,
        ['id', 'name', 'description', 'created_at', 'updated_at'])
      console.log(playlistData)
      const trackData = await commonService.findAndCountAll(PlaylistTrack, { playlist_id: playlistData.dataValues.id },
        ['track_id', 'created_at', 'updated_at'])
      console.log(trackData)
      trackData.playlist = playlistData
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, trackData)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  /** ************************************************************ */
  /* UserMedia Methods
      - Create UserMedia - covers Top Songs, Top Artsts
      - Delete UserMedia
  */
  async createUserMedia (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await schema.userMedia.validate(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      req.body.user_id = req.decoded.id
      const data = req.body.data
      const params = data.map((item) => {
        return {
          user_id: req.decoded.id,
          media_id: item.media_id,
          media_image: item.media_image,
          media_name: item.media_name,
          meta_data: item.meta_data,
          media_type: req.params.media_type
        }
      })
      const mediaData = await commonService.bulkCreate(UserMedia, params)
      console.log('Data is:', mediaData)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, mediaData)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getRecentPosts (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const pagination = commonService.getPagination(req.query.page, req.query.pageSize)
      console.log(pagination)
      const myLikeData = await commonService.findAll(LikeUnlike, { user_id: req.decoded.id }, ['media_type', 'media_id'])
      const myMediaTypes = myLikeData.map(data => { return data.media_type })
      console.log(myMediaTypes)
      const myMediaids = myLikeData.map(data => { return data.media_id })
      console.log(myMediaids)
      const myRecentPosts = await userService.getMyRecentPosts(req.decoded.id, pagination, myMediaids, myMediaTypes)
      console.log('myrecentposts', myRecentPosts)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, myRecentPosts)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async deleteUserMedia (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const userId = req.decoded.id
      // if (req.params.type === '1') {
      const validationResult = await schema.deleteMedia.validate(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      const params = {
        user_id: userId,
        media_id: req.body.media_id,
        media_type: req.params.media_type
      }
      const result = await commonService.delete(UserMedia, params)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, result)
    } catch (err) {
      console.log('err is:', err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async userSearch (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const userName = req.query.name
      const condition = {
        name: {
          [Op.iLike]: '%' + userName + '%'
        }
      }
      const userList = await commonService.findAndCountAll(User, condition, ['id', 'name', 'profile_picture'])
      // console.log(JSON.stringify(userList, null, 2))
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, userList)
    } catch (err) {
      console.log('err is:', err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getProfile (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    let profileData
    // console.log('User id', req.params.userId)
    // console.log('Decoded id', req.decoded.id)

    try {
      const userId = req.params.userId
      const body = {
        user_id: userId // (5)
      }
      if (req.decoded.id /* 1 */ === userId) {
        profileData = await profileService.getProfile(body)
      } else {
        const userDetail = await commonService.findOne(User, { id: body.user_id }, ['is_privacy'])
        if (!userDetail.is_privacy) {
          profileData = await profileService.getProfile(body)
        } else {
          const result = await commonService.findOne(UserFollower, { user_id: userId, follower_id: req.decoded.id }) // user (1) is following user(5) or not
          console.log('result is:', result)
          if (result) {
            profileData = await profileService.getProfile(body)
          } else {
            profileData = await profileService.getProfile(body)
            console.log('Profile data is:', profileData)
            delete profileData.topSong
            delete profileData.topArtist
            delete profileData.recentPost
          }
        }
      }
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, profileData)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async uploadFile (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      if (!req.file) {
        util.failureResponse(res, config.constants.BAD_REQUEST, langMsg.failed)
      }
      const myFile = req.file.originalname.split('.')
      const fileType = myFile[myFile.length - 1]
      const body = {
        fileType: fileType,
        buffer: req.file.buffer
      }
      const data = await s3Bucket.uploadToS3(body)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, data)
    } catch (error) {
      console.log('Error is:', error)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getAccountDetails (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const attributes = ['id', 'name', 'username', 'email', 'phone_number', 'date_of_birth', 'profile_picture', 'biography']
      const profileData = await commonService.findOne(User, { id: req.decoded.id }, attributes)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, profileData)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async checkUserPrivacy (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const userId = req.decoded.id
      const validationResult = await userSchema.userPrivacy.validate(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      // const attributes = ['is_privacy']
      const isUserPrivacyOn = await commonService.update(User, { is_privacy: req.body.is_privacy }, { id: userId })
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, isUserPrivacyOn)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getUserMedia (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      if (req.decoded.id) {
        const savedSongArtists = await commonService.findAndCountAll(UserMedia, { user_id: req.decoded.id, media_type: req.params.media_type }, ['media_id', 'media_image', 'media_name', 'meta_data'])
        util.successResponse(res, config.constants.SUCCESS, langMsg.success, savedSongArtists)
      }
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }
}

module.exports = ProfileController
