import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import { globalErrorHandling } from "./utilies/errorHandling.js";
import authRouter from "./modules/user/user.router.js";
import chatRouter from "./modules/Chat/Chat.router.js"
import postRouter from "./modules/Post/Post.router.js"



const initApp = (app, express) => {
mongoose.connect('mongodb://localhost:27017/Dashboard', { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });  app.use(cors(), express.json());
  app.use(compression());
  //convert Buffer Data
  if (process.env.MOOD == "DEV") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("common"));
  }

  app.use(`/user`, authRouter);
  app.use(`/chat`, chatRouter);
  app.use(`/post`, postRouter);



  app.use("*", (req, res, next) => {
    res.send(
      `${process.env.APP_NAME} | In-valid Routing, Please check URL or Method`
    );
  });
  app.use(globalErrorHandling);
};

export default initApp;
