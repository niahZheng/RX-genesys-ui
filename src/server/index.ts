import { readFile } from "fs";
import path from "path";
import express, {Express, Router} from "express";
import helmet from "helmet";
import {createServer} from "http";
import setupWebsockets from "@server/websockets";
import setupTelemetry from "@server/telemetry";
import setupEnvironment from "@server/routes/environment";
import setupAuth from "@server/auth";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const ENABLE_AUTH = process.env.ENABLE_AUTH === "true";
const ANN_WRAPPER_DASHBOARD = process.env.ANN_WRAPPER_DASHBOARD || 'http://localhost:3003'
setupTelemetry();

const app: Express = express();
const router = Router();
const server = createServer(app);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "img-src": ["'self'", "https: data:", "https://*.cac1.pure.cloud", "https://*.canadacentral-01.azurewebsites.net",],
      "default-src": ["'self'"],
      "connect-src": [
        "'self'",
        "http://localhost:5173",
        "http://localhost",
        "https://*.watson.appdomain.cloud",
        `${ANN_WRAPPER_DASHBOARD}`,
        "http://localhost:*",
        "ws://localhost:*",
        "wss://localhost:*",
        "https://*.nr-data.net",
        "https://shyrka-prod-cac1.s3.ca-central-1.amazonaws.com",
        "https://*.newrelic.com",
        "https://*.cac1.pure.cloud",
        "wss://*.cac1.pure.cloud",
        "https://*.canadacentral-01.azurewebsites.net"
      ],
      "frame-ancestors": ["*"],
      "script-src": [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        "http://localhost:5173",
        "http://localhost",
        "https://*.watson.appdomain.cloud",
        `${ANN_WRAPPER_DASHBOARD}`,
        "http://localhost:*",
        "https://*.nr-data.net",
        "https://*.newrelic.com",
        "https://*.cac1.pure.cloud",
        "https://rx-genesys-ui-fjc0crcvebaya0g3.canadacentral-01.azurewebsites.net",
        "https://*.canadacentral-01.azurewebsites.net"
      ],
      "style-src": [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        "http://localhost:5173",
        "http://localhost",
        "https://*.watson.appdomain.cloud",
        `${ANN_WRAPPER_DASHBOARD}`,
        "http://localhost:*",
        "https://*.canadacentral-01.azurewebsites.net"
      ]
    }
  }
}));

if (ENABLE_AUTH) {
  setupAuth(app);
}

app.use("/", express.static("./dist/client"));

setupWebsockets(app);
setupEnvironment(router);

app.use("/api", router);

server.listen(PORT, () =>
  console.log(`[server]: Server is running at http://localhost:${PORT}`)
);

/*
if (true) {
  const socketServer = createServer();
  const io = new Server(socketServer);

  io.on('connection', (socket) => {
    socket.on('join', function (room) {
      socket.join(room);
    });
  });

  socketServer.listen(8000, () =>
    console.log(`[server]: Socket.io server is running at http://localhost:8000`)
  );
}*/
