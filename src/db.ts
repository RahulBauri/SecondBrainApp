import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

export const connectDB = (url: any) => {
  return mongoose.connect(url);
};

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

export const userModel = model('User', userSchema);
