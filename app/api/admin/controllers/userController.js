const CommonService = require('../services/commonService')
const UserService = require('../services/userService')
const util = require('../../../utils/utils')
const config = require('../../../config/index')
const User = require('../../../models/user')
const schema = require('../schemaValidator/userSchema')
// const { Console } = require('winston/lib/winston/transports')

const commonService = new CommonService()
const userService = new UserService()

class UserController {
  async login (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    schema.login.validateAsync(req.body).then(async () => {
      // const loginResponse = await userService.login(req.body)
      // console.log('lets try2', loginResponse)
      const loginResponse = await commonService.findOne(User, { role: 2, email: (req.body.email).toLowerCase() }, ['id', 'name', 'username', 'email', 'phone_number',
        'password', 'is_privacy', 'is_verified', 'is_active', 'createdAt', 'updatedAt'])
      // console.log( loginResponse)
      if (!loginResponse) {
        util.failureResponse(res, config.constants.NOT_FOUND, langMsg.notFound)
      } else if (!loginResponse.password) {
        util.failureResponse(res, config.constants.NOT_FOUND, langMsg.notFound)
      } else {
        const didMatch = await util.comparePassword(req.body.password, loginResponse.password)
        if (didMatch) {
          const payload = {
            id: loginResponse.id,
            username: loginResponse.username,
            role: 2,
            isActive: loginResponse.is_active
          }
          const token = await util.generateJwtToken(payload)
          // console.log('token is', token)
          await commonService.update(User, { device_token: token }, { email: req.body.email.toLowerCase() })
          loginResponse.token = token
          delete loginResponse.password
          util.successResponse(res, config.constants.SUCCESS, langMsg.loginSuccess, loginResponse)
        } else {
          util.failureResponse(res, config.constants.UNAUTHORIZED, langMsg.wrongPassword)
        }
      }
    }, reject => {
      util.failureResponse(res, config.constants.BAD_REQUEST, reject.details[0].message)
    }).catch(err => {
      console.log(err)
      util.failureResponse(res, langMsg.internalServerError, config.constants.internalServerError)
    })
  }

  async logout (req, res) {
    console.log(req.decoded.id)
    const langMsg = config.messages[req.app.get('lang')]
    try {
      console.log(req.decoded.id)
      await commonService.update(User, { device_token: null }, { id: req.decoded.id })
      util.successResponse(res, config.constants.SUCCESS, langMsg.logOut, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getAdminProfile (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      console.log(req.decoded.id)
      const myProfile = await commonService.findOne(User, { id: req.decoded.id }, ['name', 'username', 'biography', 'phone_number', 'date_of_birth'])
      util.successResponse(res, config.constants.SUCCESS, langMsg.successResponse, myProfile)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getUserProfile (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await schema.viewUserProfile.validateAsync(req.params)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      // console.log(req.params.id)
      const myProfile = await commonService.findOne(User, { id: req.params.id }, ['name', 'username', 'email', 'phone_number', 'date_of_birth'])
      util.successResponse(res, config.constants.SUCCESS, langMsg.successResponse, myProfile)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async getUsers (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const pagination = commonService.getPagination(req.query.page, req.query.pageSize)
      const userName = req.query.name
      const data = await userService.listUsers(userName, pagination)
      // console.log(data)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, data)
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async userSearch (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const pagination = commonService.getPagination(req.query.page, req.query.pageSize)
      const userName = req.query.name

      const userList = await userService.getUsers(userName, pagination)
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, userList)
    } catch (err) {
      console.log('err is:', err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async blockUnblockUser (req, res) {
    console.log('caleed', req.body)
    const langMsg = config.messages[req.app.get('lang')]
    try {
      const validationResult = await schema.blockUnblockUser.validateAsync(req.body)
      if (validationResult.error) {
        util.failureResponse(res, config.constants.BAD_REQUEST, validationResult.error.details[0].message)
        return
      }
      if (req.params.type === 'block') {
        const data = await commonService.update(User, { is_active: false }, { id: req.body.ids, role: 1 })
        console.log(data)
      } else if (req.params.type === 'unblock') {
        const data = await commonService.update(User, { is_active: true }, { id: req.body.ids, role: 1 })
        console.log(data)
      }
      util.successResponse(res, config.constants.SUCCESS, langMsg.success, {})
    } catch (err) {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    }
  }

  async changePassword (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    schema.changePassowrd.validateAsync(req.body).then(async () => {
      const data = await commonService.findOne(User, { id: req.decoded.id }, ['password'])
      console.log('OLd pwd is:', data.old_password)
      const isPasswordMatched = await util.comparePassword(req.body.old_password, data.password)
      if (isPasswordMatched) {
        const passwordHash = await util.encryptPassword(req.body.new_password)
        const updateResult = await commonService.update(User, { password: passwordHash }, { id: req.decoded.id })
        if (updateResult) { util.successResponse(res, config.constants.SUCCESS, langMsg.changePassowrd, {}) }
      } else {
        util.failureResponse(res, config.constants.BAD_REQUEST, langMsg.incorrectPassword)
      }
    }).catch(err => {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    })
  }

  async forgotPassword (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    schema.forgotPassword.validateAsync(req.body).then(async () => {
      // const userExist = await userService.forgotPassword(req.body)
      const userExist = await commonService.findOne(User, { role: 2, email: req.body.email })
      // console.log('eeeeeeeeeeeeeeeeeeeeeeee', userExist)
      if (!userExist) {
        util.failureResponse(res, config.constants.NOT_FOUND, langMsg.notFound)
      }
      const getEmail = await userService.sendResetLink(userExist.email, userExist.name)
      // console.log('email portion', getEmail)
      if (!getEmail) {
        util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
      }
      const payload = { id: userExist.id, username: userExist.username, role: 2 }
      const token = await util.generateJwtToken(payload)
      userExist.token = token
      delete userExist.password
      delete userExist.role
      delete userExist.device_token
      delete userExist.verification_token
      delete userExist.social_user_id
      util.successResponse(res, config.constants.SUCCESS, langMsg.linkSent, userExist)
    }, reject => {
      util.failureResponse(res, config.constants.BAD_REQUEST, reject.details[0].message)
    }).catch(err => {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    })
  }

  async resetPassword (req, res) {
    const langMsg = config.messages[req.app.get('lang')]
    schema.resetPassword.validateAsync(req.body).then(async () => {
      const passwordHash = await util.encryptPassword(req.body.password)
      req.body.password = passwordHash
      // const userExist = await userService.forgotPassword(req.body)
      const userExist = await commonService.findOne(User, { role: 2, email: req.body.email })
      if (!userExist) {
        util.failureResponse(res, config.constants.NOT_FOUND, langMsg.notFound)
      }
      const resetPasswordToken = await util.generatePasswordReset()
      console.log('resetPasswordToken', resetPasswordToken)
      await commonService.update(User, { resetPasswordToken: resetPasswordToken, resetPasswordExpires: Date.now() + 3600000 }, { id: userExist.id })
      // await userService.updateResetPasswordToken({ resetPasswordToken: resetPasswordToken, id: userExist.id })
      // const getResetPasswordToken = await userService.getResetPasswordToken(req.body)
      const getResetPasswordToken = await commonService.findOne(User, { email: userExist.email }, ['reset_password_token', 'reset_password_expires'])
      console.log('resetpasswordtakendetails', getResetPasswordToken)
      const resetPassword = await userService.resetPassword({ getResetPasswordToken: getResetPasswordToken.reset_password_token, getResetPasswordExpires: getResetPasswordToken.reset_password_expires, newPassword: req.body.password })
      if (!resetPassword) {
        util.failureResponse(res, config.constants.UNAUTHORIZED, langMsg.notFound)
      }
      userExist.token = resetPasswordToken
      delete userExist.password
      delete userExist.role
      delete userExist.device_token
      delete userExist.verification_token
      delete userExist.social_user_id
      util.successResponse(res, config.constants.SUCCESS, langMsg.passwordUpdated, userExist)
    }, reject => {
      util.failureResponse(res, config.constants.BAD_REQUEST, reject.details[0].message)
    }).catch(err => {
      console.log(err)
      util.failureResponse(res, config.constants.INTERNAL_SERVER_ERROR, langMsg.internalServerError)
    })
  }
}

module.exports = UserController
