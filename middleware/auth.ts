import jwt,{JwtPayload} from 'jsonwebtoken'
import {Request,Response, NextFunction}from 'express';
interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}   

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token= authHeader?.split(' ')[1];
    if(!token) {
        return res.status(401).json({error: "Access Denied No Token Found"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user = decoded;
        next();
        
    } catch (error) {
        console.error("JWT verification failed:", error instanceof Error ? error.message : error);
        return res.status(403).json({error: "Invalid Token"});
    }
}