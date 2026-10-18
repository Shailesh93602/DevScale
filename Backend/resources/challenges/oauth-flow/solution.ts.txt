interface Client {
  id: string;
  secret: string;
  redirectUri: string;
}

interface AuthCodeEntry {
  clientId: string;
  redirectUri: string;
  expiresAt: number;
}

class OAuthServer {
  private clients: Map<string, Client>;
  private codes: Map<string, AuthCodeEntry>;

  constructor(clients: Client[]) {
    this.clients = new Map(clients.map(c => [c.id, c]));
    this.codes = new Map();
  }

  public authorize(params: {
    clientId: string;
    redirectUri: string;
    state: string;
  }): { code: string; state: string } {
    const client = this.clients.get(params.clientId);
    if (!client || client.redirectUri !== params.redirectUri) {
      throw new Error("Invalid client or redirect URI");
    }

    const code = Math.random().toString(36).substring(7);
    this.codes.set(code, {
      clientId: params.clientId,
      redirectUri: params.redirectUri,
      expiresAt: Date.now() + 600000 // 10 minutes
    });

    return { code, state: params.state };
  }

  public token(params: {
    clientId: string;
    clientSecret: string;
    code: string;
    redirectUri: string;
  }): { access_token: string; token_type: string; expires_in: number } {
    const client = this.clients.get(params.clientId);
    const authCode = this.codes.get(params.code);

    // 1. Validate credentials
    if (!client || client.secret !== params.clientSecret) {
      throw new Error("Invalid client credentials");
    }

    // 2. Validate code exists and is not expired
    if (!authCode || authCode.expiresAt < Date.now()) {
        throw new Error("Invalid or expired authorization code");
    }

    // 3. SEC CRITICAL: Validate code belongs to this client and redirect URI matches
    if (authCode.clientId !== params.clientId || authCode.redirectUri !== params.redirectUri) {
        throw new Error("Mismatched authorization code parameters");
    }

    // 4. SEC CRITICAL: Codes MUST be single-use
    this.codes.delete(params.code);

    const accessToken = "JWT_" + Math.random().toString(36).substring(7);
    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600
    };
  }
}
