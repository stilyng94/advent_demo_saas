import express from "express"
import cors from "cors"
import producer, { dataType } from "./producer";
import dotenv from "dotenv"

dotenv.config()






const app = express()


app.use(cors())
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false })
)
app.use(express.json())




// spin database for tenant



app.get("/api", async (_, res) => {

  return res.send("admin server is healthy")
})




app.listen(process.env.PORT || 5004).on("request", (rq) => {
  console.log(rq.url);

  return console.log(rq.headers.host);
}).on("listening", async () => {
  await producer.start()
  await producer.send(dataType.toBuffer({ "event": "UPDATE", "data": 100 }))
})