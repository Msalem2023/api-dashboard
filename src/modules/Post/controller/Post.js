import PostModel from "../../../../DB/model/Post.model.js";
import userModel from "../../../../DB/model/user.model.js";
import { asyncHandler } from "../../../utilies/errorHandling.js";

export const CreateMeeting=asyncHandler(async (req, res) => {
    const creator=req.user.id
    const { startDate, office, project, selectedTime, participants } = req.body;

    try {
        const newMeeting = await PostModel.create({
            startDate,
            office,
            project,
            selectedTime,
            participants,
            creator, 

        });

        res.status(201).json(newMeeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

export const Meeting=asyncHandler( async (req, res) => {
    const { userName } = req.user;
    
    try {        
        const posts = await PostModel.find()
        .populate('creator');
        const filteredPosts = posts.filter(post => 
            post.creator.userName === userName || post.participants.includes(userName)
        );
        
        const meetingsWithParticipants = [];
        for (const meeting of filteredPosts) {
            const participantsWithDetails = [];
            for (const participant of meeting.participants) {
                const user = await userModel.findOne({ userName: participant });
                participantsWithDetails.push(user || participant);
            }
            meetingsWithParticipants.push({
                ...meeting.toObject(),
                participants: participantsWithDetails,
            });
        }
        if (!meetingsWithParticipants.length) {
            return res.status(404).json({ message: 'No meetings found' });
        }
        return res.status(200).json(meetingsWithParticipants);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})