import "dotenv/config";

export enum DbType {
  MYSQL,
  IN_MEMORY,
  SQLITE,
}

export interface DbConfig {
  dbHost?: string;
  dbVersion?: string;
  dbPassword?: string;
  dbPort?: number;
  dbName?: string;
  dbType: DbType;
  dbUser?: string;
  dbSSL?: boolean;
}

function getDbType(typeString: string): DbType {
  const dbTypeString = typeString as keyof typeof DbType;
  return DbType[dbTypeString];
}

export default function dbConfig(): DbConfig {
  const config: DbConfig = {
    dbHost: process.env.DB_HOST,
    dbVersion: process.env.DB_VERSION,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: parseInt(process.env.DB_PORT ?? "3306"),
    dbName: process.env.DB_NAME,
    dbType: process.env.DB_TYPE
      ? getDbType(process.env.DB_TYPE)
      : DbType.IN_MEMORY,
    dbUser: process.env.DB_USER,
    dbSSL: process.env.DB_SSL?.toLowerCase() === "true" || false,
  };

  // Check environement variables
  if (config.dbType === DbType.MYSQL) {
    if (!config.dbHost) {
      throw new Error("Missing configuration for database: DB_HOST");
    }

    if (!config.dbUser) {
      throw new Error("Missing configuration for database: DB_USER");
    }

    if (!config.dbPassword) {
      throw new Error("Missing configuration for database: DB_PASSWORD");
    }
  }

  return config;
}
