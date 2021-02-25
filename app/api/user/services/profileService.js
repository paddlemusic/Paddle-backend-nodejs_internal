const User = require('../../../models/user')
const UserFollower = require('../../../models/userFollower')
const UserMedia = require('../../../models/userMedia')
// const LikePost = require('../../../models/likePost')
// const UserPost = require('../../../models/userPost')
// const Sequelize = require('sequelize')
// const Op = Sequelize.Op
const CustomError = require('../../../utils/customError')

const CommonService = require('../services/commonService')
const commonService = new CommonService()

const UserService = require('../services/userService')
const userService = new UserService()

const config = require('../../../config')

class ProfileService {
  async getProfile (params) {
    // let userDetail, topSongDetails, topArtistDetails, recentPostsDetails, pagination, follwerDetails, followingDetails
    // const userDetail = await commonService.findOne(User, { id: params.user_id }, ['name', 'id', 'profile_picture', 'is_privacy'])
    // console.log('Params is:', JSON.stringify(userDetail, null, 2))

    console.log('Params is:', params)
    // return new Promise((resolve, reject) => {
    const userDetail = await commonService.findOne(User, { id: params.user_id }, ['id', 'name', 'username', 'profile_picture', 'is_privacy', 'biography'])
    const follwerDetails = await UserFollower.findAndCountAll({
      where: { user_id: params.user_id },
      raw: true
    })
    const followingDetails = await UserFollower.findAndCountAll({
      where: { follower_id: params.user_id },
      raw: true
    })
    const topSongDetails = await commonService.findAll(UserMedia,
      { user_id: params.user_id, media_type: config.constants.MEDIA_TYPE.TRACK, usermedia_type: config.constants.USER_MEDIA_TYPE.TOP_TRACKS_ARTISTS },
      ['media_id', 'media_name', 'media_image', 'meta_data', 'meta_data2', 'usermedia_type'])

    const topArtistDetails = await commonService.findAll(UserMedia,
      { user_id: params.user_id, media_type: config.constants.MEDIA_TYPE.ARTIST, usermedia_type: config.constants.USER_MEDIA_TYPE.TOP_TRACKS_ARTISTS },
      ['media_id', 'media_name', 'media_image', 'meta_data', 'meta_data2', 'usermedia_type'])
    const pagination = commonService.getPagination(null, 0)
    const recentPostsDetails = await userService.getMyRecentPosts(params.user_id, pagination)

    const data = {
      userDetail,
      follower: follwerDetails.count,
      following: followingDetails.count,
      topSong: topSongDetails,
      topArtist: topArtistDetails,
      recentPost: recentPostsDetails
    }

    return new Promise((resolve, reject) => {
      if (data) {
        resolve(data)
      } else {
        reject(new Error('Data is not coming'))
      }
    })
  }

  editDetails (params) {
    return new Promise((resolve, reject) => {
      console.log(params)
      const userAttribute = ['id', 'name', 'username', 'phone_number', 'date_of_birth', 'biography', 'profile_picture']
      User.update(params, { where: { id: params.id }, returning: true, attributes: userAttribute })
        .then(result => resolve(result))
        .catch(err => {
          if (err.original.code === '23505' || err.original.code === 23505) {
            switch (err.errors[0].path) {
              case 'phone_number':
                reject(new CustomError('Phone number is already registered.'))
                break
              case 'email':
                reject(new CustomError('Email address is already registered.'))
                break
              case 'username':
                reject(new CustomError('Username is already registered.'))
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
}

module.exports = ProfileService
