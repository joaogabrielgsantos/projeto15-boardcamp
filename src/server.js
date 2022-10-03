import express from 'express';
import dotenv from 'dotenv';
import {connection} from '../src/database.js'

dotenv.config();
const app = express()
app.use(express.json());


app.get("/status", (req, res) => {
	console.log("GET /status...");
	res.send("Tudo OK");
});


app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));