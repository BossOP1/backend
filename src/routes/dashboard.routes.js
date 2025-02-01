import { Router } from "express";
import { getChannelStats } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router();
router.use(verifyJWT);

router.route("/u/:userId").get(getChannelStats);

export default router;