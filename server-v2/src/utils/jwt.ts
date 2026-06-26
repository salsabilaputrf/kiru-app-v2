import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET  = process.env.JWT_SECRET  || 'ganti-dengan-secret-panjang-dan-aman';
const JWT_EXPIRES = (process.env.JWT_EXPIRES || '8h') as SignOptions['expiresIn'];

export interface JwtPayload {
  userId:   number;
  username: string;
  role:     'owner' | 'admin' | 'kasir';
  branchId: number | null;
}

/**
 * Membuat JWT token dari payload user yang berhasil login.
 */
export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Memverifikasi dan men-decode JWT token.
 * Melempar error jika token tidak valid atau sudah kedaluwarsa.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}