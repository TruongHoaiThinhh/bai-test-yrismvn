import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Snippet from "@/models/Snippet";
import { withAuth, AuthenticatedRequest } from "@/lib/auth";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const snippet = await Snippet.findById(id).select('-__v').populate('author', 'name email');
      
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }

      return res.status(200).json(snippet);
    } catch (error) {
      console.error('Error fetching snippet:', error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  if (req.method === "PUT") {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Cần đăng nhập để cập nhật snippet" });
      }

      const snippet = await Snippet.findById(id);
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }

      if (snippet.author.toString() !== req.user._id) {
        return res.status(403).json({ message: "Không có quyền cập nhật snippet này" });
      }

      const { title, description, code, tags, programmingLanguage } = req.body || {};
      
      const updateData: { title?: string; description?: string; code?: string; tags?: string[]; programmingLanguage?: string } = {};
      if (title) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (code) updateData.code = code;
      if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      if (programmingLanguage) updateData.programmingLanguage = programmingLanguage;

      const updatedSnippet = await Snippet.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('author', 'name email');

      return res.status(200).json(updatedSnippet);
    } catch (error) {
      console.error('Error updating snippet:', error);
      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Cần đăng nhập để xóa snippet" });
      }

      const snippet = await Snippet.findById(id);
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }

      if (snippet.author.toString() !== req.user._id) {
        return res.status(403).json({ message: "Không có quyền xóa snippet này" });
      }

      await Snippet.findByIdAndDelete(id);

      return res.status(200).json({ message: "Snippet đã được xóa thành công" });
    } catch (error) {
      console.error('Error deleting snippet:', error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}

export default function(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return handler(req as AuthenticatedRequest, res);
  } else {
    return withAuth(handler)(req, res);
  }
}
