import express from 'express';
import multer from "multer";
import {
    createStream,
    getStreamData,
    deleteStream,
    getChatToken
} from "#root/controllers/stream.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/create", upload.single("file"), createStream);
router.delete("/:id", deleteStream);
router.get("/:id", getStreamData);
router.post("/getChatToken", getChatToken);

export default router;