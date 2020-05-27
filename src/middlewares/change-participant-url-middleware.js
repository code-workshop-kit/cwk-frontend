import { cwkState } from '../utils/CwkStateSingleton.js';

export const changeParticipantUrlMiddleware = async (ctx, next) => {
  const fromIFrame = ctx.header['sec-fetch-dest'] === 'iframe';

  await next();

  if (ctx.status === 200 && ctx.response.is('html') && !fromIFrame) {
    const { state } = cwkState;

    if (ctx.ip === '::1') {
      if (state.adminConfig.followMode && state.wss && state.wsConnections) {
        // Send URL update message to all connections, which excludes admins because they don't get the follow mode script inserted
        for (const entry of state.wsConnections) {
          const [, connection] = entry;
          connection.send(JSON.stringify({ type: 'update-url', data: ctx.url }));
        }
      }
    }

    state.previousAdminUrl = ctx.url;
    cwkState.state = state;
  }
};