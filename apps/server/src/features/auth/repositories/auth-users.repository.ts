import type { User } from "../entities/user.entity.js";

export const AUTH_USERS_REPOSITORY = Symbol("AUTH_USERS_REPOSITORY");

export interface AuthUsersRepository {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
  findById(userId: string): Promise<User | undefined>;
}
