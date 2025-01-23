import { Router } from "express";
import { deleteVideo, getVideoById, publishAVideo, updateVideo } from "../controllers/video.controllers.js";
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
        .patch(upload.single("thumbnail"), updateVideo);


export default router;

