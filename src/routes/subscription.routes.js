import { Router } from "express";
import { getSubscribedChannel, getUserChannelSubscriber, toggleSubscription } from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router();

router.use(verifyJWT)

router.route("/c/:channelId").post(toggleSubscription)
router.route("/subscribers/c/:channelId").get(getUserChannelSubscriber)
router.route("/subscribers/s/:subscriberId").get(getSubscribedChannel)


export default router
