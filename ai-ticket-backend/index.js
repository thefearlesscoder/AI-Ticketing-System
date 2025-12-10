import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/user.routes.js';
import 

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes); // user routes

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Mongo Db connected");
        app.listen(PORT, () => console.log(`✅Server running on port ${PORT}`));
    })
    .catch((err) => console.error("❌ Mongo Db connection error", err));