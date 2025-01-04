import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const signup = joi
  .object({
    userName: joi.string().min(2).max(20).required(),
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword,
  })
  .required();

export const signIn = joi
  .object({
    email: generalFields.email,
    password: generalFields.password,
  })
  .required();

export const updateUser = joi
  .object({
    image: generalFields.file,
  })
  .required();
  export const updateTitle = joi
  .object({
    role:joi.string().required(),
  })
  .required();

export const token = joi
  .object({
    Authorization: joi.string().required(),
  })
  .required();

export const sendCode = joi
  .object({
    email: generalFields.email,
  })
  .required();

export const forgetPassword = joi
  .object({
    email: generalFields.email,
    password: generalFields.password,
    code: joi
      .string()
      .pattern(new RegExp(/^\d{4}$/))
      .required(),
  })
  .required();