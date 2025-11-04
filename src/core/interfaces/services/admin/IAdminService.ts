import {Admin, Prisma} from "@prisma/client";

/**
 * Admin Service Interface
 * Defines business logic operations for admin analytics and reporting
 */
export interface IAdminService {
  /**
   * Get admins data
   */
  getAdmins(): Promise<Array<Admin>>;

  /**
   * create admin
   */
  createAdmin(): Promise<Array<Admin>>;

  /**
   * create admin
   */
  updateAdmin(): Promise<boolean>;

  /**
   * create admin
   */
  deleteAdmin(): Promise<boolean>;
}

