import { User } from '../../entities/User';
import { Injectable } from '@nestjs/common';
import { Config } from '@ofm/nestjs-utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  @Config('aaa', 'bbb', 'ccc')
  ccc = undefined as any;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getHello(): Promise<string> {
    const users = await this.usersRepository.find();
    return 'Hello World! ' + JSON.stringify(users[0]);
  }
}
