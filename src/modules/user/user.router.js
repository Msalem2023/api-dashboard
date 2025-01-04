import * as authController from "./controller/user.js";
import * as validators from "../auth/validation.js";
import { validation } from "../../middleware/validation.js";
import { Router } from "express";
import { fileUpload, fileValidation, ImageUpload } from "../../utilies/multer.js";
import { asyncHandler } from "../../utilies/errorHandling.js";
import userModel from "../../../DB/model/user.model.js";
import { auth, roles } from "../../middleware/auth.js";
const router = Router();
const { Admin, Supervisor, Employee } = roles;
router.post("/team", auth([Admin,Supervisor,Employee]), authController.getUsers);
router.post("/notification", auth([Admin,Supervisor,Employee]), authController.notification);
router.post("/signup", validation(validators.signup), authController.signup);
router.put("/update",ImageUpload(fileValidation.image).single("image"),auth([Admin, Supervisor, Employee]),authController.updateUser)
// router.put("/updaterole",auth([Admin]),validation(validators.updateTitle))
  
router.get("/confirmEmail/:token",authController.confirmEmail);

router.post("/signin", validation(validators.signIn), authController.signIn);

export default router;