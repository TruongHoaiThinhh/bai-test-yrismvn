import mongoose, { Document, Schema } from 'mongoose';

export interface ISnippet extends Document {
  title: string;
  description?: string;
  code: string;
  tags: string[];
  programmingLanguage: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SnippetSchema = new Schema<ISnippet>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [10000, 'Code cannot be more than 10000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot be more than 50 characters']
  }],
  programmingLanguage: {
    type: String,
    required: [true, 'Programming language is required'],
    default: 'typescript'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  }
}, {
  timestamps: true
});

export default mongoose.models.Snippet || mongoose.model<ISnippet>('Snippet', SnippetSchema);