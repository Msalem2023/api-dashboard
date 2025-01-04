import mongoose, { Schema, Types, model } from "mongoose";
const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    userName: {
      type: String,
      required: true,
      min: 2,
      max: 20,
      unique: true,
      lower: true,
      trim: true,
    },
    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "userName is required"],
      lower: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    socketId: String,
    address: String,
    role: {
      type: String,
      default: "Supervisor",
      enum: ["User", "Admin", "Supervisor", "Super Manager"],
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "offline",
      enum: ["offline", "online", "blocked"],
    },
    image: String,
    DOB: Date,
    title:String,
    Supervisor: {
      type: Types.ObjectId,
      ref: "User",
  },
    changePasswordTime: Date,
  },
  {
    timestamps: true,
  }
);
userSchema.virtual("Posts", {
  ref: "Post",
  foreignField: "userId",
  localField: "_id"
})
userSchema.virtual("Messages", {
  ref: "Message",
  foreignField: "Sender",
  localField: "_id"
})
userSchema.virtual("Following", {
  ref: "Friends",
  foreignField: "Following",
  localField: "_id"
})
userSchema.virtual("Followers", {
  ref: "Friends",
  foreignField: "Followers",
  localField: "_id"
})

const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;