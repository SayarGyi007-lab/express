import mongoose, { model, Schema } from "mongoose";

const postSchema = new Schema({
    title:{
        type: String,
        required: true,
        index: true
    },
    description:{
        type: String,
        required: true,
    },
  
    comments:[{

        type: Schema.Types.ObjectId,
        ref: "comment",
        
    }]
},{timestamps: true})

export const post = mongoose.model("post",postSchema)