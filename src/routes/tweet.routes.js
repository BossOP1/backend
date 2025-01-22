import { Router } from "express";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTweet)
router.route("/user/:userId").get(getUserTweet)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet)

export default router;