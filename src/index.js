import aws from "aws-sdk/lib/maintenance_mode_message.js";
aws.suppress = true;

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import https from "https";
import routes from "#root/routes/index.js";
import webhookRoute from "#root/routes/stripe-webhook.js";
import dataSource from "#root/config/ormConfig.js";

await dataSource.initialize();

const app = express();

app.use(cors());

app.use("/stripe-webhook", webhookRoute);
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use("/api/v1", routes);

if (fs.existsSync(`/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`)) {
  const options = {
    key: fs.readFileSync(
      `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`
    ),
    cert: fs.readFileSync(
      `/etc/letsencrypt/live/${process.env.DOMAIN}/cert.pem`
    ),
    ca: fs.readFileSync(
      `/etc/letsencrypt/live/${process.env.DOMAIN}/chain.pem`
    ),
  };

  const port = process.env.SERVER_HTTPS_PORT || 443;
  https.createServer(options, app).listen(port);
  console.log("Server is running at port " + port);
} else {
  const port = process.env.SERVER_HTTP_PORT || 80;
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}
