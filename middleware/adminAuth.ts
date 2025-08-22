import {Request,Response,NextFunction} from 'express'
import jwt,{JwtPayload}from 'jsonwebtoken'

// Middleware to check if user is authenticated and has admin role
interface AdminRequest extends Request {
    user?: string | JwtPayload;
}

export const requireAdmin= (req:AdminRequest,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization;
    const token= authHeader?.split(' ')[1];
    if(!token) {
        return res.status(401).json({error: "Access Denied No Token Found"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        if (req.user && (req.user as JwtPayload).role === 'admin') {
            next();
        } else {
            return res.status(403).json({error: "Admin Access Required"});
        }
    } catch (error) {
        console.error("JWT verification failed:", error instanceof Error ? error.message : error);
        return res.status(403).json({error: "Invalid Token"});
    }
}
