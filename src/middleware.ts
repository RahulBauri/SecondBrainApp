import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({
      message: 'auth header is not present/correct',
    });
  }

  const secret = process.env.JWT_USER_PASSWORD;

  if (!secret) {
    throw new Error('JWT secret is not defined');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & { id: string };

    const { id } = decoded;

    //@ts-ignore
    req.userId = id;

    next();
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: 'you are not signed in' });
  }
};
