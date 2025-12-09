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
            return res.status(401).json({
                message: "user not found"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({
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

export const logout = async(req, res) => {
    // for logout just on client side remove the token.
    try{
        // cehck if user is logged in
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({message: "user not logged in"});
        }
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({message: "user not logged in"});
        }
        // verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if(err){
                return res.status(401).json({message: "invalid token"});
            };

            res.json({message: "user logged out successfully"}); // not technically needed revoking token on server side
        })
    }catch(error){
        res.status(500).json({message: "error in logout", error: error.message});
    }
}

export const updateUser = async (req, res)  => {
    const {skills = [], role, email} = req.body;
    // authentication and authorization done using middleware
    try{
        if(req.user?.role !== 'admin'){
            return res.status(403).json({message: "only admin can update user"});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "user not found"});
        }

        await User.updateOne(
            {email},
            {skills: skills.length ? skills : user.skills, role: role || user.role}
        )
        return res.json({message: "user updated successfully"});
    }catch(error){
        res.status(500).json({message: "error in updating user", error: error.message});
    }
}

export const getUsers = async (req, res) => {
    try{
        if(req.user.role !== 'admin'){
            return res.status(403).json({message: "only admin can get user details"});
        }
        const users = await User.find().select("-password")
        return res.json({users});
    }catch(error){
        res.status(500).json({message: "error in getting users", error: error.message});
    }
}