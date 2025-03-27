import mongoose, { model, Schema } from "mongoose";

const commentSchema = new Schema({
   
    content:{
        type: String,
       
    },
  
    owners:[{

        type: Schema.Types.ObjectId,
        ref: "post",
        
    }]
},{timestamps: true})

export const comment = mongoose.model("comment",commentSchema)