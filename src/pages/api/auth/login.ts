import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcryptjs';
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: "Lỗi kết nối database" });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu đều bắt buộc" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email);

    // Set cookie for SSR
    res.setHeader('Set-Cookie', `authToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`); // 7 days

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau" });
  }
}