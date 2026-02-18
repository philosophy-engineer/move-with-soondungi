import { User } from "../entities/user.entity.js";
import { UserOrmEntity } from "./typeorm/entities/user.orm-entity.js";

export function toDomainUser(ormEntity: UserOrmEntity): User {
  return User.rehydrate({
    userId: ormEntity.id,
    email: ormEntity.email,
    passwordHash: ormEntity.passwordHash,
    createdAt: ormEntity.createdAt.toISOString(),
    updatedAt: ormEntity.updatedAt.toISOString(),
  });
}

export function toUserOrmEntity(domainEntity: User): UserOrmEntity {
  const ormEntity = new UserOrmEntity();

  if (domainEntity.userId) {
    ormEntity.id = domainEntity.userId;
  }

  ormEntity.email = domainEntity.email;
  ormEntity.passwordHash = domainEntity.passwordHash;

  if (domainEntity.createdAt) {
    ormEntity.createdAt = new Date(domainEntity.createdAt);
  }

  if (domainEntity.updatedAt) {
    ormEntity.updatedAt = new Date(domainEntity.updatedAt);
  }

  return ormEntity;
}
