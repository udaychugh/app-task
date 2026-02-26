import { IUserRepository } from '../../domain/repositories';
import { PublicUser } from '../../domain/entities';

interface UpdateCityInput {
  userId: string;
  city: string;
}

export class UpdateCityUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: UpdateCityInput): Promise<PublicUser> {
    const user = await this.userRepo.updateCity(input.userId, input.city);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
