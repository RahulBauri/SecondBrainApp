import express from 'express';
import dotenv from 'dotenv';
import zod from 'zod';
import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';

dotenv.config();

import { connectDB } from './db';
import { userModel } from './db';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/v1/signup', async (req, res) => {
  const signupSchema = zod.object({
    username: zod
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(10, 'Username must be at most 10 characters')
      .regex(/^[A-Za-z]+$/, 'Username must contain only letters'),
    password: zod
      .string()
      .min(8, 'Minimum 8 characters')
      .max(20, 'Maximum 20 characters')
      .regex(/[a-z]/, 'Must include a lowercase letter')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/\d/, 'Must include a number')
      .regex(/[^A-Za-z\d]/, 'Must include a special character'),
  });

  const zodResponse = signupSchema.safeParse(req.body);

  if (!zodResponse.success) {
    return res.status(411).json({
      errors: zodResponse.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }

  const { username, password } = zodResponse.data;

  const allUsers = await userModel.find({});

  const isUserAlreadyPresent =
    allUsers.filter((user) => user.username === username).length > 0;

  if (isUserAlreadyPresent)
    return res
      .status(403)
      .json({ message: 'User already exists with this username' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    await userModel.create({
      username,
      password: hashedPassword,
    });
    res.json({
      message: 'signed up',
    });
  } catch (error: any) {
    // if (error.code === 11000) {
    //   /* add "unique:true" in the schema for this to work */
    //   return res.status(403).json({
    //     message: 'User already exists with this username',
    //   });
    // }

    res.status(500).json({ message: 'Server error', error });
    console.log(error);
  }
});

app.post('/api/v1/signin', async (req, res) => {
  const signinSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
  });

  const zodResponse = signinSchema.safeParse(req.body);

  if (!zodResponse.success) {
    return res.status(411).json({ msg: 'Invalid inputs' });
  }

  const { username, password } = zodResponse.data;

  try {
    const user = await userModel.findOne({ username });

    if (!user) {
      return res
        .status(403)
        .json({ message: "user with that username doesn't exists" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).json({ message: 'Incorrect password' });
    }

    const secret = process.env.JWT_USER_PASSWORD;

    if (!secret) {
      throw new Error('JWT secret is not defined');
    }

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: '30d',
    });

    res.status(200).json({ message: 'Signin successfull', token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});
app.post('/api/v1/content', (req, res) => {});
app.get('/api/v1/content', (req, res) => {});
app.delete('/api/v1/content', (req, res) => {});
app.post('/api/v1/brain/share', (req, res) => {});
app.get('/api/v1/brain/:shareLink', (req, res) => {});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();
