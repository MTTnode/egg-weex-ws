module.exports = {
  schedule: {
    interval: '30s',
    type: 'worker',
  },
  async task(ctx) {
    ctx.app.weexWs.heartbeat(ctx);
  }

};