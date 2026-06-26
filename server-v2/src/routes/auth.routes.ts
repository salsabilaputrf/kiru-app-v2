import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service';
import { LoginBodySchema, ChangePasswordBodySchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middlewares/auth.middleware';

const authService = new AuthService();

export async function authRoutes(fastify: FastifyInstance) {

  /**
   * POST /login
   * Body: { username, password }
   * Response: { success, token, user }
   */
  fastify.post(
    '/login',
    { schema: { body: LoginBodySchema } },
    async (request, reply) => {
      const { username, password } = request.body as {
        username: string;
        password: string;
      };

      try {
        const result = await authService.login(username, password);
        return reply.status(200).send({ success: true, ...result });
      } catch (error: any) {
        if (error.message === 'ERR_INVALID_CREDENTIALS') {
          return reply.status(401).send({
            success: false,
            message: 'Username atau password salah.',
          });
        }
        return reply.status(500).send({ success: false, message: error.message });
      }
    },
  );

  /**
   * PUT /change-password
   * Header: Authorization: Bearer <token>
   * Body: { oldPassword, newPassword }
   * Response: { success, message }
   */
  fastify.put(
    '/change-password',
    {
      schema: { body: ChangePasswordBodySchema },
      onRequest: [authenticate], // endpoint ini wajib login terlebih dahulu
    },
    async (request, reply) => {
      const { oldPassword, newPassword } = request.body as {
        oldPassword: string;
        newPassword: string;
      };

      try {
        const result = await authService.changePassword(
          request.user!.userId,
          oldPassword,
          newPassword,
        );
        return reply.status(200).send({ success: true, ...result });
      } catch (error: any) {
        if (error.message === 'ERR_WRONG_OLD_PASSWORD') {
          return reply.status(400).send({
            success: false,
            message: 'Password lama yang kamu masukkan tidak sesuai.',
          });
        }
        return reply.status(500).send({ success: false, message: error.message });
      }
    },
    
  );

fastify.get(
    '/test-auth',
    async (request, reply) => {
      return reply.status(400).send({
            success: true,
            message: 'Test auth route works!',
          });
    },
    
  );

}