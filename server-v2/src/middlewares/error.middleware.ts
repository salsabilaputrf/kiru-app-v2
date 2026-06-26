import { FastifyInstance, FastifyError } from 'fastify';

export async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    // Error validasi Typebox/Fastify (400)
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        message: 'Data yang dikirim tidak valid.',
        errors:  error.validation,
      });
    }

    // Log error untuk debugging
    fastify.log.error(error);

    // Generic error (500)
    return reply.status(error.statusCode ?? 500).send({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  });
}