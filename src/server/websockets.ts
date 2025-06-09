import {Express} from "express";
import {createProxyMiddleware} from "http-proxy-middleware";

// AAN_SOCKETIO_SERVER has protocol and port inside
const ANN_SOCKETIO_SERVER = process.env.ANN_SOCKETIO_SERVER ? process.env.ANN_SOCKETIO_SERVER : "https://rx-api-server-ddfrdga2exavdcbb.canadacentral-01.azurewebsites.net:443";

export default function setupWebsockets(app: Express) {
  // Add logging middleware before the proxy
  app.use('/socket.io', (req, res, next) => {
    console.log('WebSocket connection attempt to:', ANN_SOCKETIO_SERVER);
    next();
  });

  const proxy = createProxyMiddleware({
    pathFilter: "/socket.io",
    target: `${ANN_SOCKETIO_SERVER}`,
    changeOrigin: true,
    ws: true
  });

  app.use(proxy);
}
