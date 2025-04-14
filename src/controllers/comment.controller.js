import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler";
import { comments } from "../models/comment.model.js";

export const getCommentVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {page=1,limit=10} = req.query

    if(!videoId){
        throw new ApiError(400, "Video id can not find")
    }

    const comment =  await comments.findById({video:videoId})
                                    .populate("owner", "username avatar fullName")    //Replaces a referenced ObjectId(owner id) with actual document data
                                    .skip((page - 1) * limit)   // how many items to skip when i am in a particular page.
                                    .limit(Number(limit))       // show how many comment
                                    .sort({ createdAt: -1 });   // Show newest comments first

    const total = await comments.countDocuments({ video: videoId });
    return res.status(200).json(
        new ApiResponse(200, { comment, total }, "Comments fetched successfully")
    );

})


export const addComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const comment = req.body

    if(comment.trim()==""){
        throw new ApiError(400,"comment content required")
    }

    const createComment = await comments.create({
        comment,
        video: videoId,
        owner: req.user._id
    })

    const populatedComment = await createComment.populate("owner", "username avatar fullName");

    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment added successfully")
    );

})


export const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await comments.findById(commentId);

    if (!comment) throw new ApiError(404, "Comment not found");
    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(403, "You're not allowed to edit this comment");
    }

    comment.content = content || comment.content;
    await comment.save();

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});


export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await comments.findById(commentId);

    if (!comment) throw new ApiError(404, "Comment not found");
    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(403, "You're not allowed to delete this comment");
    }

    await comment.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});


