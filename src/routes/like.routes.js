import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";





const router = Router();
router.use(verifyJWT)

router.route("/v/:videoId").get(toggleVideoLike)
router.route("/c/:commentId").get(toggleCommentLike)
router.route("/t/:tweetId").get(toggleTweetLike)
router.route("/u/:userId").get(getLikedVideos)



export default router