import { initNodeFederation } from '@softarc/native-federation-node';

export const reqHandler = (async () => {
  // Skip federation init during dev - it will be handled client-side
  const isDev = process.env['NODE_ENV'] !== 'production';
  
  if (!isDev) {
    await initNodeFederation({
      relBundlePath: '../browser/'
    });
  } else {
    console.log('Development mode: Skipping server-side federation init');
  }

  const bootstrap = await import('./bootstrap-server');
  return bootstrap.reqHandler;

})();
