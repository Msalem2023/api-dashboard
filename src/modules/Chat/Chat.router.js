import {  Router } from "express"
import { auth, roles } from "../../middleware/auth.js"
import { Attachment, Chatting, CreateGroupChat, Message, Reaction, VoiceNote } from "./controller/Chat.js"
import { fileUpload, fileValidation, ImageUpload } from "../../utilies/multer.js";
import ChatModel from "../../../DB/model/Chat.model.js";
const router = Router()
const { Admin, Supervisor, Employee } = roles;
router.post('/', auth([Admin, Supervisor, Employee]), Chatting)
router.post('/Message', auth([Admin, Supervisor, Employee]), Message)
router.post('/voice-notes', fileUpload(fileValidation.audio).single('file'), auth([Admin, Supervisor, Employee]),VoiceNote) 
router.post('/attachments', ImageUpload(fileValidation.image).array('image[]', 10), auth([Admin, Supervisor, Employee]),Attachment)
router.post('/reactions', auth([Admin, Supervisor, Employee]),Reaction)
router.post('/Group', auth([Admin]),CreateGroupChat)
router.post('/my-chats',auth([Admin, Supervisor, Employee]), async (req, res) => {
    try {
        const userId = req.user.id; 

        const chats = await ChatModel.find({
            Users: { $in: [userId] } 
        }).populate('Users').populate({
            path: 'Messages',
            populate: {
                path: 'Sender',
            }
        });
        if (!chats || chats.length === 0) {
            return res.status(404).json({ message: 'No chats found for this user.' });
        }
        return res.json({ chats });
    } catch (error) {
        console.error('Error fetching user chats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router