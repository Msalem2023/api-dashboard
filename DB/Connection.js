import mongoose from "mongoose";

const connection= async()=>{
    return (await mongoose.connect('mongodb://localhost:27017/Dashboard', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err)))
}
export default connection