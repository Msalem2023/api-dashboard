import ChatModel from "../../../../DB/model/Chat.model.js"
import MessageModel from "../../../../DB/model/Message.model.js"
import { asyncHandler } from "../../../utilies/errorHandling.js";
import { Cloudinary, uploadToCloudinary } from "../../../utilies/Cloudinary.js";


export const Chatting = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.body.id;

        const chat = await ChatModel.findById(receiverId)
            .populate("Users")
            .populate({
                path: 'Messages',
                populate: [
                    { path: 'Sender' },
                    { path: 'ReadBy' }
                ],
            });
        if (chat) {

            const otherUserMessages = await MessageModel.find({
                ChatId: chat._id,
                Sender: { $ne: senderId }
            }).populate('Sender').populate('ReadBy');
            if (otherUserMessages.length === 0) {
                return res.status(200).json({ Chat:chat});
            }
            const lastMessagesByUser = {};

            otherUserMessages.forEach(message => {
                const userId = message.Sender._id.toString();
                if (!lastMessagesByUser[userId] || message.createdAt > lastMessagesByUser[userId].createdAt) {
                    lastMessagesByUser[userId] = message; 
                }
            });
            const updatePromises = Object.values(lastMessagesByUser).map(async (lastMessage) => {
                if (!lastMessage.ReadBy.some(readById => readById.equals(senderId))) {
                    lastMessage.ReadBy.push(senderId); 
                    await MessageModel.findByIdAndUpdate(
                        lastMessage._id,
                        { ReadBy: lastMessage.ReadBy },
                        { new: true }
                    );
                }
            });
            await Promise.all(updatePromises);

        } else {
            const chat = await ChatModel.findOne({
                $or: [
                    { Sender: senderId, Receiver: receiverId },
                    { Sender: receiverId, Receiver: senderId }
                ]
            }).populate({
                path: 'Sender',
            }).populate({
                path: 'Receiver',
            }).populate({
                path: 'Messages',
                populate: {
                    path: 'Sender',
                }
            });
            if (chat) {
                console.log(senderId)
                await MessageModel.updateMany(
                    {
                        ChatId: chat._id,
                        Sender: { $ne: senderId },
                        status: 'unread'
                    },
                    { $set: { status: 'read' } }
                );
                return res.json({ Chat: chat });
            } else {
                const newChat = await ChatModel.create({ Sender: senderId, Receiver: receiverId });
                const populatedChat = await ChatModel.findById(newChat._id).populate({
                    path: 'Sender',
                }).populate({
                    path: 'Receiver',
                }).populate({
                    path: 'Messages',
                    populate: {
                        path: 'Sender',
                    }
                });
                return res.json({ Chat: populatedChat });
            }
        }
        return res.status(201).json({ Chat: chat });

    } catch (error) {
        console.error('Error in Chatting function:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
export const Message = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { ChatId, Message } = req.body;
        if (!ChatId || !Message) {
            return res.status(400).json({ error: 'ChatId and Message are required.' });
        }
        const newMessage = await MessageModel.create({ Message, Sender: senderId, ChatId });
        return res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
export const VoiceNote = asyncHandler(async (req, res) => {
    try {
        const senderId = req.user.id;
        const { ChatId } = req.body;
        if (!ChatId || !req.file) {
            return res.status(400).json({ error: 'ChatId and a file are required.' });
        }
        const voiceNoteUrl = await uploadToCloudinary(req.file.buffer);
        const newMessage = await MessageModel.create({
            Message: voiceNoteUrl,
            Sender: senderId,
            ChatId,
        });

        return res.status(201).json({ message: 'Message sent successfully', newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})
export const Attachment = asyncHandler(async (req, res) => {
    try {
        console.log(req.files)
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded.' });
        }
        const uploadPromises = req.files.map(file => Cloudinary(file.path));
        const imageUrls = await Promise.all(uploadPromises);
        const newMessage = await MessageModel.create({
            Message: imageUrls,
            Sender: req.user.id,
            ChatId: req.body.ChatId,
        });
        res.status(200).json({ success: true, message: newMessage, imageUrls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

export const Reaction = asyncHandler(async (req, res) => {
    const { messageId, emoji } = req.body;
    try {
        const message = await MessageModel.findById(messageId);
        if (!message) {
            return res.status(404).send('Message not found');
        }
        const existingReactionIndex = message.reactions.findIndex(
            (r) => JSON.stringify(r.userId) === JSON.stringify(req.user.id)
        );

        if (existingReactionIndex > -1) {
            if (message.reactions[existingReactionIndex].reaction === emoji) {
                await MessageModel.findOneAndUpdate(
                    { _id: messageId },
                    { $pull: { reactions: { userId: req.user.id } } },
                    { new: true }
                );
            } else {
                await MessageModel.findOneAndUpdate(
                    { _id: messageId, 'reactions.userId': req.user.id },
                    { $set: { 'reactions.$.reaction': emoji } },
                    { new: true }
                );
            }
        } else {
            await MessageModel.findOneAndUpdate(
                { _id: messageId },
                { $push: { reactions: { userId: req.user.id, reaction: emoji } } },
                { new: true }
            );
        }
        const updatedMessage = await MessageModel.findById(messageId);
        return res.json({ message: "done", updatedMessage });
    } catch (error) {
        console.error('Error handling reaction:', error);
        return res.status(500).send('Server Error');
    }
})

export const CreateGroupChat = async (req, res, next) => {
    try {
        const senderId = req.user.id;
        const { participants } = req.body;
        if (!Array.isArray(participants || participants.length === 0)) {
            return res.status(400).json({ error: 'participantIds must be an array and include the sender.' });
        }

        const participantIds = participants.map(participant => participant._id);
        const userIds = [...new Set([...participantIds, senderId])];
        const groupChat = await ChatModel.create({
            Users: userIds,
            ChatType: 'group',
        });
        return res.status(201).json({ Chat: groupChat, message: 'Group chat created successfully.' });
    } catch (error) {
        console.error('Error creating group chat:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

