import sharedPrismaClient from "../extensions/database/sharedPrismaClient";
import tenantPrismaClient from "../extensions/database/tenantPrismaClient";
import { getNamespace } from 'continuation-local-storage';
import { PrismaClient as TenantPrismaClient } from '@prisma/client'



let connectionMap = {};

/**
 *  Create prisma instance for all the tenants defined in common database and store in a map.
**/
export async function connectAllDb() {

  try {
    const tenants = await sharedPrismaClient.tenant.findMany();
    connectionMap =
      tenants
        .map(tenant => {
          return {
            [tenant.organization]: tenantPrismaClient(`${process.env.DATABASE_BASE_URL}/tenant_${tenant.organization}_db`)
          }
        })
        .reduce((prev, next) => {
          return Object.assign({}, prev, next);
        }, {});
    console.log("pool: ", Object.keys(connectionMap));

  } catch (e) {
    console.log('error', e);

    return;
  }


}


/**
 *  Get the connection information  for the given tenant's slug.
**/
export function getConnectionSubdomain(subdomain: string) {
  if (connectionMap) {
    return connectionMap[subdomain];
  }
}

/**
 *  Get the connection information  for current context.
**/
export function getConnection() {
  const nameSpace = getNamespace('database middleware');
  const conn = nameSpace?.get('dbConnection');

  if (!conn) {
    throw new Error('Connection is not set for any tenant database.');
  }

  return conn;
}

export function addConnectionToPool(organization: string, client: TenantPrismaClient) {
  connectionMap[organization] = client
  console.log("pool: ", Object.keys(connectionMap));

}