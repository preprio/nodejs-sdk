declare module '@preprio/nodejs-sdk' {
  interface ClientOptions {
    token?: string;
    baseUrl?: string;
    timeout?: number;
    userId?: string;
  }

  class PreprClient {
    public constructor({
      token: string = null,
      baseUrl: string = 'https://cdn.prepr.io',
      timeout: number = 4000,
      userId: string = null,
    }: ClientOptions);

    public token(token: string): this;
    public userId(userId: string): this;
    public timeout(milliseconds: number): this;
    public query(query: Record<string, any>): this;
    public sort(field: string): this;
    public limit(limit: number): this;
    public skip(skip: number): this;
    public path(path: string): this;
    public graphqlQuery(graphQLQuery: string): this;
    public graphqlVariables(graphQLVariables: Record<string, any>): this;
    public async fetch(options = {}): Promise<Record<string, any>>;
  }
  export function createPreprClient(options: ClientOptions): PreprClient;
}
