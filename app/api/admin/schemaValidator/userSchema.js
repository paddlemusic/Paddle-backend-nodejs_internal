const Joi = require('@hapi/joi')

const schema = {
  login: Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).max(30).required()
  }),
  blockUnblockUser: Joi.object().keys({
    ids: Joi.array().items(Joi.number()).unique(),
    type: Joi.string()
  }),
  forgotPassword: Joi.object().keys({
    email: Joi.string().trim().email().required()
  }),
  resetPassword: Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(26).required()
  }),
  changePassowrd: Joi.object().keys({
    old_password: Joi.string().required(),
    new_password: Joi.string().min(6).max(26).required()
  }),
  editDetails: Joi.object().keys({
    name: Joi.string().trim().max(30),
    phone_number: Joi.string().trim().max(17).min(10),
    date_of_birth: Joi.string().trim(),
    profile_picture: Joi.string().trim()
  }),
  viewUserProfile: Joi.object().keys({
    id: Joi.number().required()
  })
}

module.exports = schema
