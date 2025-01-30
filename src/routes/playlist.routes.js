import { Router } from "express";
import { addVideoToPlaylist, CreatePlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router();
router.use(verifyJWT)


router.route("/").post(CreatePlaylist);
router.route('/user-playlists/u/:userId').get(getUserPlaylists)
router.route("/playlist-by-id/pi/:playlistId").get(getPlaylistById)
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);
router.route("/deletePlaylist/p/:playlistId").delete(deletePlaylist)
router.route("/update-playlist/p/:playlistId").patch(updatePlaylist)

export default router;