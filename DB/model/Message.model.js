import { Types, Schema, model } from "mongoose";

const MessageSchema = new Schema({
    Message: {
        type: Schema.Types.Mixed,
    },
    ChatId: {
        type: Types.ObjectId,
        ref: "Chat",
    },
    Sender: {
        type: Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        default: "unread"
    },
    reactions: [{
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        },
        reaction: {
            type: String, 
            required: true
        }
    }],
    ReadBy:[{
        type:Types.ObjectId,
        ref:"User"
    }]

}, {
    timestamps: true
})
const MessageModel = model('Message', MessageSchema)
export default MessageModel