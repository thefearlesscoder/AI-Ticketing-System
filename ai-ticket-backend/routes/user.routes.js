import express from "express";
import { getUsers, login, logout, signup, updateUser } from "../controllers/user";
import { authenticate } from "../middlewares/auth";


const router = express.Router();

// update user
router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);
router.post("/signup", signup)
router.post("/login", login)
router.post("logout", logout) // skipped auth for time being

export default router;  // this router needs to be used in index.js