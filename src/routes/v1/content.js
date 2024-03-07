import express from "express";
import multer from "multer";
import {
  uploadContent,
  updateContent,
  deleteContent,
  initiateUpload,
  uploadFile,
  completeUpload,
  addVideo,
  updateVideo,
  deleteVideo,
  getVideos,
  getPlaylists,
  viewVideo,
  viewContent,
} from "#root/controllers/content.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/videos", getVideos);
router.get("/playlists", getPlaylists);

router.post("/initiate-upload", initiateUpload);
router.post("/upload", uploadFile);
router.post("/complete-upload", completeUpload);
router.post("/video", upload.single("file"), addVideo);
router.put("/video/:id", upload.single("file"), updateVideo);
router.delete("/video/:id", deleteVideo);
router.put("/video/:id/view", viewVideo);

router.post("/", uploadContent);
router.put("/:id", updateContent);
router.delete("/:id", deleteContent);
router.put("/:id/view", viewContent);

export default router;
