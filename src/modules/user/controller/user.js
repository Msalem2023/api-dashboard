import sendEmail from "../../../utilies/email.js";
import { hash, compare } from "../../../utilies/HashAndCompare.js";
import {generateToken,verifyToken} from "../../../utilies/GenerateAndVerifyToken.js";
import { asyncHandler } from "../../../utilies/errorHandling.js";
import { Cloudinary } from "../../../utilies/Cloudinary.js";
import MessageModel from "../../../../DB/model/Message.model.js";
import userModel from "../../../../DB/model/user.model.js"

export const getUsers = asyncHandler(async (req, res) => {
  const { id } = req.user
  let Team
  if (req.user.role === "Admin") {
     Team = await userModel.find(
      {
      $and: [
        { role: 'Supervisor' },
        { _id: { $ne: id } }
      ]
    }
  );
  } else if(req.user.role==="Supervisor") {
     Team = await userModel.find(
      {
      $and: [
        { role: 'Employee' },
        { _id: { $ne: id } }
      ]
    }
  );

  }
  return res.status(200).json({ Team });
});
export const notification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const messages = await MessageModel.find({
      status: 'unread'
    })
    .populate({
      path: 'ChatId',
      populate: {
        path: 'Receiver' 
      }
    })
    .populate({
      path: 'Sender' 
    });
    const newMessages = messages.filter(message => JSON.stringify(message.ChatId.Receiver?._id) === JSON.stringify(id));
    const unreadCount = newMessages.length;
    if (unreadCount === 0) {
      return res.json({ success: true, unreadCount, messages: [] });
    }
    res.json({ success: true, unreadCount, messages: newMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



export const signup = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;
  if (await userModel.findOne({ email: email.toLowerCase() })) {
    return next(new Error("Email address exists", { cause: 409 }));
  }
  if (await userModel.findOne({ userName: userName.toLowerCase() })) {
    return next(new Error("User Name exists", { cause: 409 }));
  }
  const token = generateToken({
    payload: { email },
    signature: process.env.SIGNITURE,
    expiresIn: 60 * 10,
  });


  const link = `http://localhost:5000/user/confirmEmail/${token}`;

  const html = `<!DOCTYPE html>
                    <html>
                    <head>
                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
                        <style type="text/css">
                            body {
                                background-color: #E1E8ED;
                                margin: 0;
                                font-family: Arial, sans-serif;
                            }
                            .container {
                                width: 80%;
                                max-width: 600px;
                                margin: auto;
                                background-color: #ffffff;
                                padding: 20px;
                                border: 1px solid #E1E8ED;
                                border-radius: 8px;
                            }
                            .header {
                                text-align: center;
                                padding-bottom: 20px;
                                border-bottom: 1px solid #E1E8ED;
                            }
                            .header img {
                                width: 50px;
                            }
                            .title {
                                color: #1DA1F2;
                                font-size: 24px;
                                margin: 20px 0;
                            }
                            .button {
                                display: block;
                                width: 100%;
                                max-width: 250px;
                                margin: 20px auto;
                                padding: 15px;
                                text-align: center;
                                color: #ffffff;
                                background-color: #1DA1F2;
                                text-decoration: none;
                                border-radius: 5px;
                            }
                            .footer {
                                text-align: center;
                                margin-top: 20px;
                                color: #657786;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                            <h1 class="title">Email Confirmation</h1>
                            <p>Hello,</p>
                            <p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
                            <a href="${link}" class="button">Verify Email Address</a>
                            <p>If you did not create an account, no further action is required.</p>
                            <div class="footer">
                                <p>&copy; 2024 Twitter Clone. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>`;

  const emailSuccess = await sendEmail({ to: email, subject: "Confirmation-Email", html });
  if (!emailSuccess) {
    return res.status(400).json({ message: "Email Rejected" });
  }
  const hashPassword = hash({ plaintext: password });
  const user = await userModel.create({
    userName: userName.toLowerCase(),
    email: email.toLowerCase(),
    password: hashPassword,
  });
  return res.status(201).json({
    user:user,
    success: true,
    message: "Account created successfully, please confirm your email",
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.user;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = await Cloudinary(req.file.path);
    const updatedUser = await userModel.findByIdAndUpdate(
      { _id: id },
      { image: imageUrl },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'Profile updated successfully', updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
export const update = asyncHandler(async (req, res, next) => {
  try {
    const { role } = req.body;
    const id = req.params.id
    const updatedUser = await userModel.findByIdAndUpdate(
      { _id: id },
      { role: role }, 
      { new: true } 
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'Profile updated successfully', updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({ token, signature: process.env.SIGNITURE });
  if (!email) {
    return next(new Error("In-valid token payload", { cause: 400 }));
  }

  const result = await userModel.updateOne(
    { email: email.toLowerCase() },
    { confirmEmail: true }
  );

  if (result.nModified === 0) {
    return res.status(400).send(`<p>Not registered account.</p>`);
  } else {
    return res.status(200).redirect(`http://localhost:3000/`);
  }
});


export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new Error("Email  not exist", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email", { cause: 400 }));
  }
  if (!compare({ plaintext: password, hashValue: user.password })) {
    return next(new Error("In-valid login data", { cause: 400 }));
  }
  const access_token = generateToken({
    payload: { id: user._id, role: user.role }  });
  user.status = "online";
  return res.status(201).json({
    success: true,
    message: "Logged in successfully",
    access_token,
    user,
  });
});
