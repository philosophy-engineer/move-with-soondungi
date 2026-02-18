import { User } from "../entities/user.entity.js";

export type UserRecord = {
  userId: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export function toUserRecord(user: User): UserRecord {
  if (!user.userId) {
    throw new Error("userId가 없는 유저는 저장 레코드로 변환할 수 없습니다.");
  }

  return {
    userId: user.userId,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toUserEntity(record: UserRecord): User {
  return User.rehydrate({
    userId: record.userId,
    email: record.email,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
