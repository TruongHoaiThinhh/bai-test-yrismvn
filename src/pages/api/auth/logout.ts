import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  res.setHeader('Set-Cookie', 'authToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');

  return res.status(200).json({ message: "Đăng xuất thành công" });
}
