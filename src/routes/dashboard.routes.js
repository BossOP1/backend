import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router();
router.use(verifyJWT);

router.route("/u/:userId").get(getChannelStats);
router.route("/c/:channelId").get(getChannelVideos);

export default router;