import { Admin } from '@prisma/client';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging with @types/passport's `interface User {}`
    interface User extends Admin {}
  }
}

export {};
