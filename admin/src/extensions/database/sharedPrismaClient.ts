import { PrismaClient as SharedPrismaClient } from "@prisma/shared"


const sharedPrismaClient = new SharedPrismaClient({
  errorFormat: "pretty", log: ['query', 'info', 'warn', 'error'],

})

export default sharedPrismaClient