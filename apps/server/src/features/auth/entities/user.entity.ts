type UserProps = {
  userId?: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export class User {
  readonly userId?: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(params: UserProps) {
    this.userId = params.userId;
    this.email = params.email;
    this.passwordHash = params.passwordHash;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static create(params: UserProps): User {
    return new User(params);
  }

  static rehydrate(params: UserProps): User {
    return new User(params);
  }
}
