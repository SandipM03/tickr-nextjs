import jwt,{ JwtPayload } from "jsonwebtoken"
import {inngest} from "@/lib/inngest/client"
import { ApiError } from "next/dist/server/api-utils";
import { ApiResponse } from "@/lib/utils/apiResponse";
import User from "@/models/user"
import bcrypt from 'bcrypt';
import {Request, Response} from 'express'

interface authenticateRequest extends Request {
    user?: string | JwtPayload;
}

const signup= async(req:authenticateRequest, res:Response)=>{
    const {username,email, password, skills=[]} = req.body;
    try {
        const hashed= await bcrypt.hash(password, 10);
        const user = await User.create({username,email,password: hashed,skills})
        await inngest.send({
            name: "user/signup",
            data: user
        })
        const token= jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET as string, { expiresIn: "1h" });


        const response = new ApiResponse(201, {user, token})
            return res.status(201).json(response)

    } catch (error) {
        const response = new ApiError(500, "Internal Server Error")
        return res.status(500).json(response)
    }
} 
interface loginRequest extends Request {
    body:{
        identifier: string;
        password: string;
    }
}

const login= async(req:loginRequest, res:Response)=>{
  const {identifier, password} = req.body;

  try {
    const user= await User.findOne({
        $or:[
            { email: identifier },
            { username: identifier }
        ]
    })
    if(!user){
        const response= new ApiResponse(404, null, "User Not Found")
        return res.status(404).json(response)
    }
    const isMatch= await bcrypt.compare(password, user.password);
    if(!isMatch){
        const response= new ApiResponse(401, null, "Invalid Credentials")
        return res.status(401).json(response)
    }
    const token= jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string, { expiresIn: "1h" });


    const response = new ApiResponse(200, { user, token })
    return res.status(200).json(response)
  } catch (error) {
    const response = new ApiError(500, "Internal Server Error")
    return res.status(500).json(response)
  }
}

const logout=async(req:authenticateRequest, res:Response)=>{
    try {
        const token= req.headers.authorization?.split(' ')[1];
        if(!token){
            const response= new ApiResponse(401, null, "Unauthorized")
            return res.status(401).json(response)
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            const response = new ApiError(500, "JWT secret is not configured");
            return res.status(500).json(response);
        }
        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                const response = new ApiResponse(401, null, "Unauthorized");
                return res.status(401).json(response);
            }
            req.user = decoded;
            return res.status(200).json({ message: "Logged out successfully" });
        });
    } catch (error) {
        const response= new ApiError(500, "Internal Server Error")
        return res.status(500).json(response)
    }
}

//get all user Admin only
const getAllUsers = async (req: authenticateRequest, res: Response) => {
    try {
        if (!req.user || (typeof req.user === "string" || (req.user as JwtPayload).role !== "admin")) {
            const response = new ApiResponse(403, null, "Forbidden");
            return res.status(403).json(response);
        }
        const users = await User.find({ role: 'user' });
        const response = new ApiResponse(200, users);
        return res.status(200).json(response);
    } catch (error) {
        const response = new ApiError(500, "Internal Server Error");
        return res.status(500).json(response);
    }
}

//get all users & moderators
const getAllModerators= async (req:authenticateRequest, res:Response)=>{
    try {
      if(!req.user || (typeof req.user === 'string' || (req.user as JwtPayload).role !== 'admin')){
        const response= new ApiResponse(403, null, "Forbidden")
        return res.status(403).json(response)
      }
      const moderators = await User.find({ role: 'moderator' });
      const response = new ApiResponse(200, moderators);
      return res.status(200).json(response);
    } catch (error) {
        const response= new ApiError(500, "Internal Server Error")
        return res.status(500).json(response)
    }
}
//promote to moderator from user

const promoteToModerator= async(req:authenticateRequest, res:Response)=>{
    try {
        const {userId}= req.params;
        const { skills = [] } = req.body;
        const user = await User.findById(userId);
        if(!user){
            const response= new ApiResponse(400, null, "User ID is required");
            return res.status(404).json(response);
        }
        if (user.role== 'admin' || user.role== 'moderator'){
            const response= new ApiResponse(400, null, "User is already a moderator or admin");
            return res.status(400).json(response);
        }
        const updatedUser= await User.findByIdAndUpdate(userId, 
            {role: 'moderator', skills: skills.length > 0 ? skills : user.skills }, 
            {new: true,select: '-password'}
        );

        const response = new ApiResponse(200, updatedUser);
        return res.status(200).json({...response, message: "User promoted to moderator successfully"});
    } catch (error) {
        const response= new ApiError(500, "Internal Server Error")
        return res.status(500).json(response)
    }
}

const updateUserSkills= async(req:authenticateRequest, res:Response)=>{
    try {
        const {userId}=req.params;
        const {skills=[]}=req.body;
        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }
        if(!skills || Array.isArray(skills)=== false){
            return res.status(400).json({
                error: "Skills must be provided as an array"
            });
        }
        if(user.role !== 'admin'){
            return res.status(403).json({ error: "Only admins can update user skills" });
        }
        const updatedSkills= await User.findByIdAndUpdate(
            userId,
            { skills },
            { new: true , select:-'-password'}
        )
        return res.status(200).json({message:'User skills updated successfully', data: updatedSkills})
    } catch (error) {
        const response= new ApiError(500, "Internal Server Error")
        return res.status(500).json(response)
    }
}
