import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, JwtPayload } from '../utils/jwt.js';

// Extend FastifyRequest agar field `user` dikenali TypeScript
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Middleware autentikasi: memastikan request membawa JWT token yang valid
 * di header Authorization: Bearer <token>
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    request.user = verifyToken(token);
  } catch {
    return reply.status(401).send({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.',
    });
  }
}

/**
 * Middleware RBAC (Role-Based Access Control).
 * Selalu dipasang SETELAH authenticate karena bergantung pada request.user.
 *
 * Contoh: authorize('owner', 'admin') → hanya owner dan admin yang bisa akses.
 */
export function authorize(...allowedRoles: JwtPayload['role'][]) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        message: 'Autentikasi diperlukan.',
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        message: `Akses ditolak. Role '${request.user.role}' tidak diizinkan mengakses resource ini.`,
      });
    }
  };
}

/**
 * Middleware khusus: memastikan Admin/Kasir hanya bisa mengakses
 * data dari cabang mereka sendiri.
 *
 * Gunakan di endpoint yang menerima `branchId` sebagai query param atau body.
 * Owner dikecualikan (boleh akses semua cabang).
 */
export async function enforceBranchScope(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = request.user;
  if (!user) return; // authenticate sudah menangani ini sebelumnya

  if (user.role === 'owner') return; // owner boleh akses semua cabang

  // Ambil branchId dari query string, params, atau body (fleksibel)
  const requestedBranchId =
    (request.params as any)?.branchId ||
    (request.query as any)?.branchId ||
    (request.body as any)?.branchId;

  if (requestedBranchId && Number(requestedBranchId) !== user.branchId) {
    return reply.status(403).send({
      success: false,
      message: 'Akses ditolak. Kamu hanya dapat mengakses data cabangmu sendiri.',
    });
  }
}