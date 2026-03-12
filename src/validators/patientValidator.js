const Joi = require('joi');

const updateProfileValidator = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  phoneNumber: Joi.string(),
  address: Joi.string().allow(''),
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  emergencyContact: Joi.string(),
  emergencyContactName: Joi.string(),
  allergies: Joi.string().allow(''),
  chronicConditions: Joi.string().allow('')
});

module.exports = {
  updateProfileValidator
};