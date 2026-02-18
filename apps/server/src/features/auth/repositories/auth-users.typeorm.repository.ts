import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { User } from "../entities/user.entity.js";
import { toDomainUser, toUserOrmEntity } from "./auth-users.typeorm.mapper.js";
import type { AuthUsersRepository } from "./auth-users.repository.js";
import { UserOrmEntity } from "./typeorm/entities/user.orm-entity.js";

@Injectable()
export class AuthUsersTypeormRepository implements AuthUsersRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const saved = await this.repository.save(toUserOrmEntity(user));
    return toDomainUser(saved);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const found = await this.repository.findOne({
      where: { email },
    });

    if (!found) {
      return undefined;
    }

    return toDomainUser(found);
  }

  async findById(userId: string): Promise<User | undefined> {
    const found = await this.repository.findOne({
      where: { id: userId },
    });

    if (!found) {
      return undefined;
    }

    return toDomainUser(found);
  }
}
