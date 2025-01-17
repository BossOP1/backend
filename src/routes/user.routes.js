import { Router } from "express";
import { refreshAccessTokens, loginUser, logoutUser, registerUser, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatarDetails, updateCoverImageDetails, getUserCurrentProfile, getWatchHistory } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
      {
        name:"avatar",
        maxCount:1,
      },
      {
        name:"coverImage",
        maxCount:1,
      }
    ]),
    registerUser)


    router.route("/login").post(loginUser)

    // secured routes

    router.route("/logout").post(verifyJWT ,logoutUser)
    router.route("/refresh-token").post(refreshAccessTokens)
    router.route("/register-user").post(registerUser)
    router.route("/change-password").post(verifyJWT,changeCurrentPassword)
    router.route("/current-user").get(verifyJWT,getCurrentUser)
    router.route("update-account").patch(verifyJWT,updateAccountDetails)
    router.route("/avatar-change").patch(verifyJWT,upload.single("avatar"),updateAvatarDetails)
    router.route("/cover-Image").patch(verifyJWT,upload.single("coverImage"),updateCoverImageDetails)
    router.route("/c/:username").get(verifyJWT,getUserCurrentProfile)
    router.route("/history").get(verifyJWT,getWatchHistory)

export default router