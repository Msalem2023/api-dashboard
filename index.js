import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bootstrap from "./src/index.router.js";
import userModel from "./DB/model/user.model.js";
import { verifyToken } from "./src/utilies/GenerateAndVerifyToken.js";

const app = express();
const port = 5000;

app.use(cors());
app.use("/uploads", express.static('./uploads'));
const server = app.listen(port, () => console.log(`${port} is working fine`));
const io = new Server(server, { cors: "*" });

io.on('connection', (socket) => {

    socket.on("updateSockets", async (data) => {
        try {
            const token=data?.token
            const { id } = verifyToken({token});
            await userModel.findOneAndUpdate(
                { _id: id },
                { socketId: socket.id },
                { new: true }
            );
        } catch (error) {
            console.error("Error verifying token or updating socket ID:", error);
            return;
        }

        socket.on('callUser', (data) => {
            io.to(data.userToCall).emit("callUser", {
                signal: data.signalData,
                from: data.from,
                name: data.name,
            });
        });

        socket.on('answerCall', (data) => {
            io.to(data.to).emit("callAccepted", data.signal);
        });

        socket.on('disconnect', () => {
            socket.broadcast.emit("callEnded");
        });
    });
});
bootstrap(app, express);
