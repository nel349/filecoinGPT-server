import bodyParser from "body-parser";
import cors from "cors";

import * as dotenv from "dotenv";
import { APP, PORT } from "./constants";
dotenv.config();

APP.use(bodyParser.json());
APP.use(
  cors({
    origin: "*",
  })
);

// if (process.env.DEV === "true") {
//   APP.use("/.well-known", express.static("./.well-known-dev"));
// } else {
//   APP.use("/.well-known", express.static("./.well-known"));
// }




// request consumer function execution
APP.post("/sendRequest", async (req:any, res:any) => {
  const { subscriptionId, consumerAddress, urlSource } = req.body;

});

APP.listen(PORT, () => {
  console.log(`Server running at http://localhost:3333`);
});