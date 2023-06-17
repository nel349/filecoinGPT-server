import bodyParser from "body-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import { APP, PORT } from "./constants";
import multer from 'multer';
import path from 'path';
import lighthouse from '@lighthouse-web3/sdk'
dotenv.config();

APP.use(bodyParser.json());
APP.use(
  cors({
    origin: "*",
  })
);

const storage = multer.diskStorage({
  destination: './public/upload/',
  filename: function(req:any, file:any, cb:any){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
}).single('file');

// request consumer function execution
APP.post("/api/generateCar", async (req:any, res:any) => {
  upload(req, res, async (err: any) => {
    if(err){
      res.send(err);
    } else {

      const filePath = req.file.path;
      console.log("file: ", filePath);

      const apiKey = req.body.apiKey;

      console.log("apikeyValue: ", apiKey);

      // Get an auth token for the data depot service
      // Note: you can use this token multiple times it expires in 20 days
      const authToken = await lighthouse.dataDepotAuth(apiKey);
      console.log("generateCAR authToken: ", authToken);



      // // Create CAR
      const response = await lighthouse.createCar(filePath, authToken.data.access_token);
      console.log("generateCAR response:", response);

      const files = await lighthouse.viewCarFiles(1, authToken.data.access_token);
      console.log("files: ", files);

      const sortedFiles = files.data.sort((a, b) => b.lastUpdate - a.lastUpdate);
      const mostRecentFile = sortedFiles[0];

      // Get file with matching id

      const downloadLink = `https://data-depot.lighthouse.storage/api/download/download_car?fileId=${mostRecentFile.id}.car`;

      console.log(`Download link: ${downloadLink}`);

      res.send({message:'File uploaded successfully', downloadLink});
    }
  });
});

APP.post("/api/viewFiles", async (req:any, res:any) => {
  upload(req, res, async (err: any) => {
    if(err){
      res.send(err);
    } else {


      const apiKey = req.body.apiKey;

      console.log("apikeyValue: ", apiKey);

      // Get an auth token for the data depot service
      // Note: you can use this token multiple times it expires in 20 days
      const authToken = await lighthouse.dataDepotAuth(apiKey);
      console.log("viewFiles authToken: ", authToken);

      const files = await lighthouse.viewCarFiles(1, authToken.data.access_token);
      console.log("files: ", files);

      const fileData = files.data.map((file: any) => {
        const downloadLink = `https://data-depot.lighthouse.storage/api/download/download_car?fileId=${file.id}.car`;
        return {
          fileName: file.fileName,
          id: file.id,
          downloadLink: downloadLink
        }
      });

      res.send({message:'Files retrieved successfully', files: fileData});
    }
  });
});

APP.listen(PORT, () => {
  console.log(`Server running at http://localhost:3333`);
});