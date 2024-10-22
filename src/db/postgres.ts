import postgres, { type Sql } from "postgresjs";

export class DatabaseBuilder {
  private writeUrl?: string;
  private readUrl?: string;
  private max_connections?: number;

  setWriteUrl(url: string): this {
    this.writeUrl = url;
    return this;
  }

  setReadUrl(url: string): this {
    this.readUrl = url;
    return this;
  }
  setMaxConnections(connection: number = 10): this {
    this.max_connections = connection;
    return this;
  }

  build(): Database {
    return Database.getInstance(
      this.writeUrl,
      this.readUrl,
      this.max_connections,
    );
  }
}

class Database {
  private static instances: {
    write: Sql | undefined;
    read: Sql | undefined;
  } = {
    write: undefined,
    read: undefined,
  };

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(
    writeUrl?: string,
    readUrl?: string,
    max_connections: number = 10,
  ): Database {
    if (!writeUrl && !readUrl) {
      throw new Error("You need to define at least one url.");
    }
    if (writeUrl && !this.instances.write) {
      this.instances.write = postgres(writeUrl, { max: max_connections });
    }

    if (readUrl && !this.instances.read) {
      this.instances.read = postgres(readUrl, { max: max_connections });
    }

    return new Database();
  }

  public getWriteConnection(): Sql {
    if (!Database.instances.write) {
      throw new Error("Write database connection is not initialized.");
    }
    return Database.instances.write;
  }

  public getReadConnection(): Sql {
    if (!Database.instances.read) {
      // Fall back to the write connection if read connection is not defined
      return this.getWriteConnection();
    }
    return Database.instances.read;
  }

  public resetConnections(): void {
    Database.instances.write = undefined;
    Database.instances.read = undefined;
  }
}
