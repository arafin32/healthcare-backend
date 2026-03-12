const Joi = require('joi');

const medicationSchema = Joi.object({
  name: Joi.string().required(),
  dosage: Joi.string().required(),
  frequency: Joi.string().required(),
  duration: Joi.string().required(),
  instructions: Joi.string().allow('')
});

const createPrescriptionValidator = Joi.object({
  patientId: Joi.string().uuid().required(),
  medications: Joi.array().items(medicationSchema).min(1).required(),
  diagnosis: Joi.string().required(),
  instructions: Joi.string().allow(''),
  validUntil: Joi.date()
});

const updatePrescriptionValidator = Joi.object({
  medications: Joi.array().items(medicationSchema),
  diagnosis: Joi.string(),
  instructions: Joi.string(),
  status: Joi.string().valid('active', 'completed', 'cancelled'),
  validUntil: Joi.date()
});

module.exports = {
  createPrescriptionValidator,
  updatePrescriptionValidator
};