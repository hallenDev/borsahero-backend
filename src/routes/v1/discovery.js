import express from "express";
import { getPopularPlaylists } from "#root/controllers/discovery.js";

const router = express.Router();

router.get("/popular-playlists", getPopularPlaylists);

export default router;
