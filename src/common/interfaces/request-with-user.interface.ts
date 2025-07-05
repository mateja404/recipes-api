import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}