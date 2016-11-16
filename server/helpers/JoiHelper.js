import Joi from 'joi';

function validate(toValidate, validationSchema, options = {}) {
  return new Promise((resolve, reject) => {
    Joi.validate(toValidate, validationSchema, options, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}

export default { validate };
