import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps:true
})

export const Tweets = mongoose.model("Tweets",tweetSchema);