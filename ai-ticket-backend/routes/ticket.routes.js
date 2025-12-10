import { get } from "mongoose";
import { createTicket, getTicket, getTickets } from "../controllers/ticket";
import { authenticate } from "../middlewares/auth";
import express from "express";

const router  = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);

export default router;