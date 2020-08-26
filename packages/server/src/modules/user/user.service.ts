import { Injectable, Session, BadRequestException } from '@nestjs/common';
import { User } from 'src/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { ErrorMessage } from 'src/constant/constant';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async query(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async reset(@Session() session, body: any): Promise<string> {
    const oldPass = body.oldPass;
    const newPass = body.newPass;
    if (session.user == null) {
      throw new BadRequestException(ErrorMessage.PLEASE_LOGIN_FIRST);
    }
    const user: User = await this.userRepository.findOne({ id: session.user.id });
    if (user == null) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST);
    }
    if (user.password !== oldPass) {
      throw new BadRequestException(ErrorMessage.OLD_PASSWORD_ERROR);
    }
    user.password = newPass;
    await this.userRepository.save(user);
    return ErrorMessage.RESET_PASSWORD_SUCCESS;
  }

  async delete(id: number): Promise<string> {
    if (id == null || null == await this.userRepository.findOne({ id: id })) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST);
    }
    await this.userRepository.delete({ id: id });
    return ErrorMessage.DELETE_USER_SUCCESS;
  }

  async setAsAdmin(id: number): Promise<string> {
    if (id == null || null == await this.userRepository.findOne({ id: id })) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST);
    }
    await this.userRepository.createQueryBuilder('user').update(User).set({ admin: 0 }).execute();
    return ErrorMessage.SET_AS_ADMIN_SUCCESS;
  }
}
