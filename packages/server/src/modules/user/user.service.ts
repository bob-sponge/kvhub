import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async query(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
