import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()
router.use(verifyJWT)

router.route("/all-video").get(getAllVideos)


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
        .patch(upload.single("thumbnail"), updateVideo)
        .get(togglePublishStatus)


export default router;

