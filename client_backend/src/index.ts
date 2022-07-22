import express from "express"
import cors from "cors"
import consumer from "./consumer";
import dotenv from "dotenv"

dotenv.config()






const app = express()


app.use(cors())
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false })
)
app.use(express.json())




app.get("/api/:id", async (req, res) => {

  return res.send(`I am ${req.params.id}`)
})

app.get("/api", async (_, res) => {

  return res.send("tenant api is healthy")
})






app.listen(process.env.PORT || 5003).on("request", (rq) => {
  console.log(rq.url);

  return console.log(rq.headers.host);
}).on("listening", async () => {
  await consumer.start()
  await consumer.startConsumer()
})