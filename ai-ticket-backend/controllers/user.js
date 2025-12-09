import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";
import user from "../models/user.js";

export const signup = async (req, res) => {
    const {email, password, skills = []} = req.body;
    try{
        const hashedPassword = bcrypt.hash(password, 10);
        const user = await User.create({email, password: hashedPassword, skills});

        await inngest.send({
            name: "user/signup",
            data: {
                email
            }
        })
        // let's make the login also.
        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
        );
        // remove the password field befire returning user object
        user.password = undefined;
        return res.json({user, token});
    }catch(error){
        res.status(500).json({message: "error in signup", error: error.message});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "user not found"
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                message: "invalid password"
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
        );
        // remove the password field before returning user object
        user.password = undefined;
        return res.json({user, token});
    }catch(error){

    }
}
