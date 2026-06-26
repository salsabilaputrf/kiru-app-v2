import Typesense from 'typesense';
import { ENV } from '../configs/env.js';

// Client dibuat sekali, dipakai ulang di seluruh aplikasi
export const typesenseClient = new Typesense.Client({
  nodes: [{
    host:     ENV.TYPESENSE.host,
    port:     ENV.TYPESENSE.port,
    protocol: ENV.TYPESENSE.protocol,
  }],
  apiKey:                   ENV.TYPESENSE.apiKey,
  connectionTimeoutSeconds: 1, // timeout cepat agar tidak hang
  numRetries:               0, // jangan retry — langsung fail dan fallback ke MySQL
});

export async function initTypesenseSchema(): Promise<void> {
  // Jika TYPESENSE_ENABLED=false di .env, skip seluruh inisialisasi
  if (!ENV.TYPESENSE.enabled) {
    console.log('ℹ️  Typesense dinonaktifkan (TYPESENSE_ENABLED=false).');
    return;
  }

  try {
    await typesenseClient.collections('products').retrieve();
    console.log('✅ Typesense: koleksi "products" sudah ada.');
  } catch {
    try {
      await typesenseClient.collections().create({
        name:   'products',
        fields: [
          { name: 'id',         type: 'string'              },
          { name: 'sku',        type: 'string', facet: true },
          { name: 'name',       type: 'string'              },
          { name: 'unit_name',  type: 'string'              },
          { name: 'barcode',    type: 'string', index: true },
          { name: 'price_sell', type: 'float'               },
        ],
        default_sorting_field: 'price_sell',
      });
      console.log('⚡ Typesense: koleksi "products" berhasil dibuat.');
    } catch (err) {
      console.warn('⚠️  Typesense tidak tersedia.', err);
    }
  }
}