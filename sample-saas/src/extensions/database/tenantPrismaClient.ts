import { PrismaClient as TenantPrismaClient } from '@prisma/client'


const tenantPrismaClient = (databaseUrl: string) => new TenantPrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: { db: { url: databaseUrl } }
})

export default tenantPrismaClient