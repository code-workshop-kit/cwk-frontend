import _esmRequire from 'esm';
import jwt from 'jsonwebtoken';
import path from 'path';

export const jwtMiddleware = rootDir => {
  const workshopFolder = path.resolve(process.cwd(), `.${rootDir}`);
  const esmRequire = _esmRequire(module);
  const { workshop } = esmRequire(`${workshopFolder}/workshop.js`);

  return async (ctx, next) => {
    await next();

    if (ctx.url === '/api/login' && ctx.method === 'POST') {
      const providedPassword = ctx.headers['cwk-admin-password'];

      if (providedPassword && providedPassword === workshop.adminPassword) {
        // Mock user
        const username = ctx.headers['cwk-user'];

        const token = jwt.sign({ username }, workshop.appKey, { expiresIn: '12h' });
        ctx.status = 200;
        ctx.body = {
          token,
        };
      } else {
        ctx.status = 401;
      }
    }
  };
};