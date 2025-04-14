import express from "express"
import { verifyJWT } from "../middlewares/auth.js"
import {getCommentVideo, addComment,updateComment,deleteComment } from "../controllers/comment.controller"




const router = express.Router()
router.use(verifyJWT)

router.route("/:videoId").get(getCommentVideo).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);









