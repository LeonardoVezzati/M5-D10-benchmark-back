import express from "express";

import cors from "cors";

import listEndpoints from "express-list-endpoints";

import moviesRouter from ".movies";

import createError from "http-errors";

import { badRequest, catchAll, forbidden, notFound } from "./errorHandler";

import path, { dirname } from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const publicDirectory = path.join(__dirname, "../public");

const server = express();

const { PORT } = process.env;

const whiteList = [
  process.env.WHITELIST_DEV_URL,
  process.env.WHITELIST_PROD_URL,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.some((allowedUrl) => allowedUrl === origin)) {
      callback(null, true);
    } else {
      const error = new Error("Not allowed by cors!");
      error.status = 403;
      callback(error);
    }
  },
};

server.use(cors(corsOptions));

server.use(express.json());

server.use(express.static(publicDirectory));

server.use("/movies", moviesRouter);

server.use(badRequest, forbidden, notFound, catchAll);

console.log(listEndpoints(server));

server.listen(process.env.PORT, () =>
  console.log("✅ Server is running on port : ", process.env.PORT)
);

server.on("error", (error) =>
  console.log(`❌ Server is not running due to : ${error}`)
);
