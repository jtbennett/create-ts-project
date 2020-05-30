import * as express from "express";
import { basename, dirname } from "path";

// See https://expressjs.com/ for info on using Express to create a web server.

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const message = `${basename(dirname(__dirname)).toUpperCase()}: Hello world`;

app.get("/", (req, res) => res.send(message));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log("Started at", new Date());
  console.log(`\n${message}`);
});
