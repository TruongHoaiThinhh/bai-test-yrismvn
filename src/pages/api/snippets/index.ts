import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Snippet from "@/models/Snippet";
import { withAuth, AuthenticatedRequest } from "@/lib/auth";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    try {
      const { title, description, code, tags, programmingLanguage } = req.body || {};
      
      if (!title || !code) {
        return res.status(400).json({ message: "Title và code là bắt buộc" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Cần đăng nhập để tạo snippet" });
      }

      const snippet = new Snippet({
        title: title.trim(),
        description: description?.trim() || '',
        code,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
        programmingLanguage: programmingLanguage || 'typescript',
        author: req.user._id
      });

      const savedSnippet = await snippet.save();
      
      return res.status(201).json({
        id: savedSnippet._id,
        title: savedSnippet.title,
        description: savedSnippet.description,
        code: savedSnippet.code,
        tags: savedSnippet.tags,
        programmingLanguage: savedSnippet.programmingLanguage,
        author: savedSnippet.author,
        createdAt: savedSnippet.createdAt,
      });
    } catch (error) {
      console.error('Error creating snippet:', error);
      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  
  if (req.method === "GET") {
    try {
      const { page = 1, limit = 10, language, search, author, tag } = req.query;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};
      
      if (language) {
        query.programmingLanguage = language;
      }
      
      if (author) {
        query.author = author;
      }
      
      if (tag) {
        query.tags = { $in: [tag] };
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      
      const snippets = await Snippet.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-__v');

      const total = await Snippet.countDocuments(query);

      return res.status(200).json({
        snippets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching snippets:', error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}

export default function(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    return withAuth(handler)(req, res);
  } else {
    return handler(req as AuthenticatedRequest, res);
  }
}