import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({

    content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
},{
    timestamps:true
})

export const comments = mongoose.model("comments",commentSchema)