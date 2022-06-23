import express from "express"
import cors from "cors"
import { exec } from 'shelljs'
import sharedPrismaClient from "./extensions/database/sharedPrismaClient";
import tenantPrismaClient from "./extensions/database/tenantPrismaClient";
import { PrismaClient as TenantPrismaClient } from '@prisma/client'
import { dbConnectionMiddleware } from "./middleware/dbConnectionMiddleware";
import { connectAllDb, getConnection, addConnectionToPool } from "./util/connectionManager";
import crypto from "crypto"
import globalNpm from "global-npm"





const app = express()


app.use(cors())
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false })
)
app.use(express.json())

app.use("/api/tenant", dbConnectionMiddleware)

app.get("/api/tenant/all", async (_, res) => {
  const tenant = await (getConnection() as TenantPrismaClient).user.findMany()
  return res.send(tenant)
})

app.post("/api/new", async (req, res) => {
  // create tenant in shared
  const organization: string = req.body.name.toLowerCase()
  const tenantId = `${organization}_${crypto.randomBytes(32).toString("hex").substring(0, 6)}`

  const exists = await sharedPrismaClient.tenant.findFirst({ where: { organization } })

  if (exists) {
    return res.sendStatus(400)
  }

  await sharedPrismaClient.tenant.create({
    data: {
      organization: organization, tenantId: tenantId
    }
  })


  // spin database for tenant

  const TENANT_DATABASE_URL = `${process.env.DATABASE_BASE_URL}/tenant_${organization}_db`

  const scriptPath = "yarn create:tenant:database"


  exec(scriptPath, { async: true, env: { DATABASE_BASE_URL: TENANT_DATABASE_URL }, fatal: true, silent: true }, async function (code, _, stderr) {
    if (code !== 0) {
      // log stderr
      //Tell customer success but wait a while to setup
      // if success hurray
      console.log(stderr)
    } else {


      // if production run npx prisma migrate deploy




      // create new admin user in new database
      const tenantClient = tenantPrismaClient(TENANT_DATABASE_URL)

      await tenantClient.user.create({
        data: {
          email: `${organization}@mail.com`, tenantId
        }
      })
      addConnectionToPool(organization, tenantClient)
    }

  })



  return res.send("success with domain")
})


app.get("/api", async (_, res) => {

  return res.send("api is healthy")
})




app.listen(process.env.PORT || 5000).on("listening", async () => {
  sharedPrismaClient.$connect();
  await connectAllDb()
}
).on("request", (rq) => {
  console.log(rq.url);

  return console.log(rq.headers.host);
})