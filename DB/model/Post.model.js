import { Types, Schema, model } from "mongoose";

const PostSchema = new Schema({
    startDate: { type: Date, required: true },
    office: { type: [String], required: true },
    project: { type: [String], required: true },
    selectedTime: { type: String, required: true },
    participants: { type: [String], required: true },
    creator: { type: Types.ObjectId,
        ref: "User", required: true },
        

}, {
    toJSON: { virtuals: true },
    timestamps: true
})
PostSchema.virtual("Comments", {
    ref: "Comment",
    foreignField: "PostId",
    localField: "_id"
})
PostSchema.virtual("Likes", {
    ref: "Like",
    foreignField: "PostId",
    localField: "_id"
})
const PostModel = model('Post', PostSchema)
export default PostModel
