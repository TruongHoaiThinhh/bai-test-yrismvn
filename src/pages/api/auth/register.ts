import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcryptjs';
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectDB();

  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Tất cả các trường đều bắt buộc" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = generateToken(savedUser._id.toString(), savedUser.email);

    // Set cookie for SSR
    res.setHeader('Set-Cookie', `authToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`); // 7 days

    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau" });
  }
}