import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken, JwtPayload } from '../utils/jwt.js';

export class AuthService {

  /**
   * Memvalidasi kredensial user lalu mengembalikan JWT token jika cocok.
   * Error dibuat generic ("Kredensial tidak valid") agar tidak membocorkan
   * informasi apakah username atau password yang salah (security best practice).
   */
  async login(username: string, password: string) {
    // Cari user berdasarkan username
    const user = await prisma.user.findUnique({
      where: { username },
      include: { branch: { select: { id: true, name: true } } },
    });

    if (!user) {
      throw new Error('ERR_INVALID_CREDENTIALS');
    }

    // Bandingkan password dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('ERR_INVALID_CREDENTIALS');
    }

    // Buat JWT payload — JANGAN masukkan password ke payload
    const payload: JwtPayload = {
      userId:   user.id,
      username: user.username,
      role:     user.role,
      branchId: user.branchId,
    };

    const token = signToken(payload);

    return {
      token,
      user: {
        id:       user.id,
        username: user.username,
        role:     user.role,
        branch:   user.branch ?? null,
      },
    };
  }

  /**
   * Mengganti password user yang sedang login.
   * Memvalidasi password lama sebelum menyimpan hash password baru.
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('ERR_USER_NOT_FOUND');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('ERR_WRONG_OLD_PASSWORD');

    const saltRounds = 10;
    const hashedNew  = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data:  { password: hashedNew },
    });

    return { message: 'Password berhasil diperbarui.' };
  }
}