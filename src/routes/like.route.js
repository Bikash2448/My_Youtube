import express from "express"
import { verifyJWT } from "../middlewares/auth.js"
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js"


export const likeRouter = express.Router()

likeRouter.use(verifyJWT)

likeRouter.route("/video/:videolike").post(toggleVideoLike)
likeRouter.route("/tweet/:tweetlike").post(toggleTweetLike)
likeRouter.route("/comment/:commentlike").post(toggleCommentLike)
likeRouter.route("/getlikevideos").get(getLikedVideos)
