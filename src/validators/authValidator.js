const Joi = require('joi');

const registerValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('patient', 'doctor', 'admin').required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  dateOfBirth: Joi.date().when('role', {
    is: 'patient',
    then: Joi.required()
  }),
  gender: Joi.string().valid('male', 'female', 'other').when('role', {
    is: 'patient',
    then: Joi.required()
  }),
  specialization: Joi.string().when('role', {
    is: 'doctor',
    then: Joi.required()
  }),
  licenseNumber: Joi.string().when('role', {
    is: 'doctor',
    then: Joi.required()
  })
});

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const resetPasswordValidator = Joi.object({
  email: Joi.string().email().required()
});

const updatePasswordValidator = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

module.exports = {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
  updatePasswordValidator
};