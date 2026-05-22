import mongoose from 'mongoose';
import { Schema, model, Types } from 'mongoose';

export const connectDB = (url: any) => {
  return mongoose.connect(url);
};

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const tagSchema = new Schema({
  title: { type: String, required: true, unique: true },
});

const contentTypes = [
  'image',
  'video',
  'article',
  'audio',
  'youtube',
  'twitter',
]; // Extend as needed

const contentSchema = new Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: 'Tag' }],
  userId: { type: Types.ObjectId, ref: 'User', required: true },
});

const linkSchema = new Schema({
  hash: { type: String, required: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
});

export const userModel = model('User', userSchema);
export const contentModel = model('Content', contentSchema);
export const tagModel = model('Tag', tagSchema);
export const linkModel = model('Link', linkSchema);
