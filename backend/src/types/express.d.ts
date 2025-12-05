export interface User {
  id: string;
  email: string;
  rol: string;
  tenantId: string;
  tenantDomain: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
