import express from "express";
import multer from "multer";
import {
  updateProfile,
  validateUsername,
  uploadProfilePhoto,
  getUserProfile,
  viewUserProfile,
} from "#root/controllers/user.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/update-profile", updateProfile);
router.post("/validate-username", validateUsername);
router.post("/upload-profile-photo", upload.single("file"), uploadProfilePhoto);
router.get("/profile/:id", getUserProfile);
router.put("/profile/:id/view", viewUserProfile);

export default router;
