export interface User {
  id: string;
  email: string;
  role: string;  // WispChat usa 'role' (inglés)
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
