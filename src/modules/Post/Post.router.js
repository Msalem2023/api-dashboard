import {CreateMeeting, Meeting } from "./controller/Post.js";
import { auth, roles } from "../../middleware/auth.js";

import{Router} from "express"
const { Admin, Supervisor, Employee } = roles;

const router = Router()
router.post('/',auth([Admin]),CreateMeeting)
router.post('/Meetings', auth([Admin, Supervisor, Employee ]),Meeting)
export default router
