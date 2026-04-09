import express from "express";
import { addRegisterSchema, addLoginSchema, refreshTokenSchema } from "../zodValidators/authSchemas.js";
import { registerUser, loginUser, refreshTokens, logoutUser } from "../services/authService.js";
import { validate } from "../middlewares/validate.js";
import { loginLimiter, registerLimiter, refreshLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

const addRegister = async (req, res, next) => {
  try {
    const data = await registerUser(req.validatedBody);
    return res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const addLogin = async (req, res, next) => {
  try {
    const data = await loginUser(req.validatedBody);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const data = await refreshTokens(req.validatedBody);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await logoutUser(req.validatedBody);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

router.post("/register", registerLimiter, validate(addRegisterSchema), addRegister);
router.post("/login", loginLimiter, validate(addLoginSchema), addLogin);
router.post("/refresh", refreshLimiter, validate(refreshTokenSchema), refresh);
router.post("/logout", validate(refreshTokenSchema), logout);

export default router;
