import {Express} from "express";
import {createProxyMiddleware} from "http-proxy-middleware";
import {IncomingMessage, ServerResponse} from "http";
// AAN_SOCKETIO_SERVER has protocol and port inside
const ANN_SOCKETIO_SERVER = process.env.ANN_SOCKETIO_SERVER ? process.env.ANN_SOCKETIO_SERVER : "https://rx-api-server-ddfrdga2exavdcbb.canadacentral-01.azurewebsites.net:443";
// const ANN_SOCKETIO_SERVER = "http://localhost:8000";
export default function setupWebsockets(app: Express) {
  // Add logging middleware before the proxy
  app.use('/socket.io', (req, res, next) => {
    console.log('Socket.IO connection attempt:', {
      url: req.url,
      method: req.method,
      transport: req.query.transport,
      timestamp: new Date().toISOString()
    });
    next();
  });
  const proxy = createProxyMiddleware({
    pathFilter: "/socket.io",
    target: ANN_SOCKETIO_SERVER,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/socket.io': '/socket.io/celery' // Rewrite path to include celery namespace
    },
    proxyTimeout: 60000, // 60 seconds
    timeout: 60000 // 60 seconds
  });
  app.use(proxy);
}