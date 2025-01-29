import { Router } from "express";
import { toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";





const router = Router();
router.use(verifyJWT)

router.route("/v/:videoId").get(toggleVideoLike)
router.route("/c/:commentId").get(toggleCommentLike)
router.route("/t/:tweetId").get(toggleTweetLike)



export default router