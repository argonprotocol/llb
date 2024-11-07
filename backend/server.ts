import fetchBitcoinPrices from './endpoints/fetchBitcoinPrices';
import fetchVaultingRatchets from './endpoints/fetchVaultingRatchets';

const CORS_HEADERS = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
};

const server = Bun.serve({
  async fetch(req) {
    const path = new URL(req.url).pathname;

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('Departed', CORS_HEADERS);
    }

    if (path === '/') {
      return Response.json({ hello: 'world' }, CORS_HEADERS);
    }

    if (path === '/fetch/bitcoinPrices') {
      const data = await fetchBitcoinPrices(req);
      return Response.json(data, CORS_HEADERS);
    }

    if (path === '/fetch/vaultingRatchets') {
      const data = await fetchVaultingRatchets(req);
      return Response.json(data, CORS_HEADERS);
    }

    // Default response for undefined paths
    return new Response('Not Found', { status: 404, ...CORS_HEADERS });
  }
});

console.log(`Listening on ${server.url}`);