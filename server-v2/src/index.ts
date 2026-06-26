// src/index.ts
// Entry point utama Kiru App v2
// Fastify + TypeBox TypeProvider + Auth + Typesense

import Fastify                               from 'fastify';
import { TypeBoxTypeProvider }               from '@fastify/type-provider-typebox';
import { ENV }                               from './configs/env.js';
import { mainRoutes }                        from './routes/main.routes.js';
import { errorHandler }                      from './middlewares/error.middleware';
import { initTypesenseSchema }               from './lib/typesense.js';

const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

const launch = async () => {
  try {
    // Inisialisasi skema Typesense 
    await initTypesenseSchema();

    // Register global error handler
    await app.register(errorHandler);

    // Register semua route 
    await app.register(mainRoutes, {
        prefix: "/api/v2",
    });

    // Jalankan server
    const port = parseInt(ENV.PORT);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🟣 Kiru App Core Engine v2 aktif → http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

launch();