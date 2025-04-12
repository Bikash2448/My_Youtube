import mongoose from "mongoose";


const likeSchema = new mongoose.Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "comments"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "tweets"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

export const likes = mongoose.model("likes", likeSchema)