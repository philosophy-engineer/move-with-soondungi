import { Injectable } from "@nestjs/common";

import type { User } from "../entities/user.entity.js";
import { type UserRecord, toUserEntity, toUserRecord } from "./auth-users.persistence.mapper.js";
import type { AuthUsersRepository } from "./auth-users.repository.js";

@Injectable()
export class AuthUsersInMemoryRepository implements AuthUsersRepository {
  private readonly users = new Map<string, UserRecord>();

  async save(user: User): Promise<User> {
    if (!user.userId) {
      throw new Error("userId가 없는 유저는 저장할 수 없습니다.");
    }

    this.users.set(user.userId, toUserRecord(user));
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    for (const record of this.users.values()) {
      if (record.email === email) {
        return toUserEntity(record);
      }
    }

    return undefined;
  }

  async findById(userId: string): Promise<User | undefined> {
    const record = this.users.get(userId);

    if (!record) {
      return undefined;
    }

    return toUserEntity(record);
  }
}
