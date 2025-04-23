import express from "express"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.js"

export const tweetRouter = express.Router()
tweetRouter.use(verifyJWT)

tweetRouter.route("/:userid").post(createTweet)
tweetRouter.route("/:tweetid").patch(updateTweet)
tweetRouter.route("/:userid").get(getUserTweets)
tweetRouter.route("/:tweetid").delete(deleteTweet)