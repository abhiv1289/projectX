import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);

router.route("/").get(getUserPlaylists);

router.route("/:playlistId").get(getPlaylistById);

router.route("/:playlistId/videos").post(addVideoToPlaylist);

router.route("/:playlistId/videos").delete(removeVideoFromPlaylist);

router.route("/:playlistId").delete(deletePlaylist);

router.route("/update-playlist/:playlistId").patch(updatePlaylist);

export default router;
