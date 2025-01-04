import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("In-valid objectId");
};
export const generalFields = {
  email: joi.string().email().required(),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .required(),
  cPassword: joi.string().required(),
  id: joi.string().custom(validateObjectId).required(),
  file: joi.object({
    filename: joi.string().required(),
    mimetype: joi.string().valid('image/jpeg',"image/jpg", 'image/png').required(),
    size: joi.number().max(10000000).required() // Example size limit: 10 MB
  }),
  
};

const dataMethod = ["body", "params", "query", "headers", "file"]
export const validation = (schema) => {
    return (req, res,next) => {
        const validationError = []
        dataMethod.forEach(key => {
            if (schema[key]) {
                const validationResult = schema[key].validate(req[key], { abortEarly: false })

                if (validationResult.error) {
                    validationError.push(validationResult.error.details)
                }
            }
        });
        if (validationError.length) {
            return res.json({ message: "validation Errors", validationError })


        } next()

    }

}