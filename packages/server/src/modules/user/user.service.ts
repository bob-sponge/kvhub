import { Injectable, Session, BadRequestException } from '@nestjs/common';
import { User } from 'src/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { ErrorMessage } from 'src/constant/constant';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async query(body: any): Promise<any> {
    const pageNo = body.pageNo;
    const pageSize = body.pageSize;
    if (pageNo < 1 || pageSize < 0) {
      throw new BadRequestException(ErrorMessage.PAGE_PARAM_ERROR);
    }
    const total = await this.userRepository.count();
    const start = (pageNo - 1) * pageSize;
    const data = await this.userRepository.query(`SELECT * FROM public.\"user\" offset ${start} limit ${pageSize}`);
    return {
      total: total,
      rows: data
    }
  }

  async reset(@Session() session, body: any): Promise<string> {
    const oldPass = body.oldPass;
    const newPass = body.newPass;
    const userId = body.userId;
    let user: User;
    if (null == userId || null == (user = await this.userRepository.findOne({ id: userId }))) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST);
    }
    if (user.admin !== 0) {
      throw new BadRequestException(ErrorMessage.MUST_ADMIN);
    }
    if (user.password !== oldPass) {
      throw new BadRequestException(ErrorMessage.OLD_PASSWORD_ERROR);
    }
    user.password = newPass;
    user.id = userId;
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
