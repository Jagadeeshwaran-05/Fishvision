const Joi = require("joi");

// Validation schemas
const schemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }),

  signin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().min(2).max(50).optional(),
    last_name: Joi.string().min(2).max(50).optional(),
    phone_number: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .optional(),
    gender: Joi.string().valid("Male", "Female", "Other").optional(),
    date_of_birth: Joi.date().max("now").optional(),
    location: Joi.string().max(200).optional(),
  }),
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      return res.status(500).json({
        success: false,
        message: "Validation schema not found",
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = validate;
