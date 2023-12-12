const allRoles = {
  user: ['getUsers', 'getBlogs', 'manageBlogs', 'getViews', 'generateBlogs'],
  admin: ['getUsers', 'getBlogs', 'manageBlogs', 'getViews', 'generateBlogs', 'manageAppSettings'],
};

export const roles: string[] = Object.keys(allRoles);
export const roleRights: Map<string, string[]> = new Map(Object.entries(allRoles));
