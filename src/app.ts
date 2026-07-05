import express from "express";
import { errorHandler } from "./common/errors/error.handler";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Wordy Backend Server");
});

app.use(errorHandler);

export default app;