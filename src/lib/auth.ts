


import type { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    _id: string;
    email: string;
    name?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const generateToken = (userId: string, email: string) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
};

export const withAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      await connectDB();

      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.cookies.authToken;

      if (!token) {
        return res.status(401).json({ message: "Thiếu token xác thực" });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }

      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }

      req.user = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name
      };

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: "Lỗi xác thực" });
    }
  };
};

export const getCurrentUser = async (req: NextApiRequest) => {
  try {
    await connectDB();
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies.authToken;
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await User.findById(decoded.userId).select('-password');
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};