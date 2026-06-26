import { FastifyInstance } from 'fastify';
import { authRoutes }    from './auth.routes';

export async function mainRoutes(fastify: FastifyInstance) {
  await fastify.register(authRoutes, { prefix: '/auth' });

}