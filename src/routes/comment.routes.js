import express from "express"
import { verifyJWT } from "../middlewares/auth.js"
import {getCommentVideo, addComment,updateComment,deleteComment } from "../controllers/comment.controller.js"




export const commentRouter = express.Router()

commentRouter.use(verifyJWT)

commentRouter.route("/:videoId").get(getCommentVideo);
commentRouter.route("/:videoId").post(addComment);
commentRouter.route("/:commentId").delete(deleteComment).patch(updateComment);
