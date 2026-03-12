const Joi = require('joi');

const createAppointmentValidator = Joi.object({
  doctorId: Joi.string().uuid().required(),
  appointmentDate: Joi.date().required(),
  appointmentTime: Joi.string().required(),
  reason: Joi.string().required()
});

const updateAppointmentValidator = Joi.object({
  appointmentDate: Joi.date(),
  appointmentTime: Joi.string(),
  reason: Joi.string(),
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled'),
  notes: Joi.string(),
  diagnosis: Joi.string(),
  cancelReason: Joi.string()
});

module.exports = {
  createAppointmentValidator,
  updateAppointmentValidator
};