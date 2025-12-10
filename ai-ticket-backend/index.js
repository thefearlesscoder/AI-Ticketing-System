import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/user.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import {serve} from "inngest/express";
import { inngest } from './inngest/client.js';
import { onUserSignup } from './inngest/functions/on-signup.js';
import { onTicketCreated } from './inngest/functions/on-ticket-create.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes); // user routes
app.use("/api/tickets", ticketRoutes); // ticket routes
// route for inngest things to work
app.use("/api/inngest", serve({
    client: inngest, 
    functions: [onUserSignup, onTicketCreated]
}));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Mongo Db connected");
        app.listen(PORT, () => console.log(`✅Server running on port ${PORT}`));
    })
    .catch((err) => console.error("❌ Mongo Db connection error", err));