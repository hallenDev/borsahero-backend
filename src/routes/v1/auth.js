import express from "express";
import {
  register,
  signIn,
  resetPassword,
  registerOTP,
  resetPassOTP,
  forgotPassword,
  logout,
} from "#root/controllers/auth.js";

import validateToken from "#root/middlewares/validateToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/signin", signIn);
router.post("/reset-password", resetPassword);
router.post("/register-OTP", registerOTP);
router.post("/reset-pass-OTP", resetPassOTP);
router.post("/forgot-password", forgotPassword);
router.post("/logout", validateToken(), logout);

export default router;
