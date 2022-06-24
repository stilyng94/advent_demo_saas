
import { createNamespace } from 'continuation-local-storage';

import { getConnectionSubdomain } from '../util/connectionManager';

// Create a namespace for the application.
let nameSpace = createNamespace('database middleware');

/**
 * Get the connection instance for the given tenant's subdomain and set it to the current context.
**/
export function dbConnectionMiddleware(req, res, next) {
  const subdomain = req.subdomains.at(0)

  if (!subdomain) {
    return res.json({ message: `Wrong domain.` }).status(400);
  }

  // Run the application in the defined namespace. It will contextualize every underlying function calls.
  nameSpace.run(() => {
    nameSpace.set('dbConnection', getConnectionSubdomain(subdomain)); // This will set the knex instance to the 'connection'
    next();
  });
}