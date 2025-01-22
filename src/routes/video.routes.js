import { Router } from "express";
import { deleteVideo, getVideoById, publishAVideo } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()
router.use(verifyJWT)

router.route("/")
    .post(
        upload.fields([
            {
                name: "videofile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),publishAVideo)

        router
        .route("/:videoId")
        .get(getVideoById)
        .delete(deleteVideo)


export default router;

