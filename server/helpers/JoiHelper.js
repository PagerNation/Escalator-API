import Joi from 'joi';

function validate(toValidate, validationSchema) {
  return new Promise((resolve, reject) => {
    Joi.validate(toValidate, validationSchema, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}

export default { validate };
