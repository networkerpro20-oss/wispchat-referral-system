export interface User {
  id: string;
  email: string;
  role: string;
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
