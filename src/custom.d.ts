import { IUserDoc } from './modules/user/user.interfaces';
import { IBlogDoc } from './modules/blog/blog.interfaces';

declare module 'express-serve-static-core' {
  export interface Request {
    user: IUserDoc;
    blog: IBlogDoc;
  }
}
