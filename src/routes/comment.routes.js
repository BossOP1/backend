import { Router } from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyJWT)


router.route("/v/:videoId").post(addComment)
router.route("/c/:commentId").patch(updateComment)
router.route("/c/:commentId").get(deleteComment)
router.route("/v/:videoId").get(getVideoComments)

export default router