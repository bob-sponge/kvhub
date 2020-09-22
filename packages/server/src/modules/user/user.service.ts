import { Injectable, Session, BadRequestException } from '@nestjs/common';
import { User } from 'src/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { ErrorMessage } from 'src/constant/constant';
import { LoginBodyVO } from 'src/vo/LoginBodyVO';

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
      rows: data,
    };
  }

  async queryById(id: number): Promise<any> {
    const user = await this.userRepository.findOne({ id: id });
    if (user == null) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST_IN_DB);
    }
    return user;
  }

  async reset(@Session() session, body: any): Promise<string> {
    if (session.user.admin != 0) {
      throw new BadRequestException(ErrorMessage.MUST_ADMIN);
    }
    const oldPass = body.oldPass;
    const newPass = body.newPass;
    const userId = body.userId;
    let user: User;
    if (null == userId || null == (user = await this.userRepository.findOne({ id: userId }))) {
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
    if (id == null || null == (await this.userRepository.findOne({ id: id }))) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST);
    }
    await this.userRepository.delete({ id: id });
    return ErrorMessage.DELETE_USER_SUCCESS;
  }

  async set(@Session() session, id: number, level: number): Promise<string> {
    if (session.user.admin != 0) {
      throw new BadRequestException(ErrorMessage.MUST_ADMIN);
    }
    let user: User;
    if (id == null || null == (user = await this.userRepository.findOne({ id: id }))) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST);
    }
    user.admin = level;
    await this.userRepository.save(user);
    return level == 0 ? ErrorMessage.SET_AS_ADMIN_SUCCESS : ErrorMessage.SET_AS_GENERAL_SUCCESS;
  }

  async setAsGeneral(id: number): Promise<string> {
    if (id == null || null == (await this.userRepository.findOne({ id: id }))) {
      throw new BadRequestException(ErrorMessage.USER_NOT_EXIST);
    }
    await this.userRepository
      .createQueryBuilder('user')
      .update(User)
      .set({ admin: 1 })
      .execute();
    return ErrorMessage.SET_AS_ADMIN_SUCCESS;
  }

  async login(vo: LoginBodyVO): Promise<User> {
    const userList = await this.userRepository.find({ name: vo.loginName });
    let user = new User();
    if (null === userList || userList.length === 0) {
      throw new BadRequestException(ErrorMessage.USER_OR_PASSWORD_IS_WRONG);
    } else {
      user = userList[0];
    }
    if (user.password !== vo.password.trim()) {
      throw new BadRequestException(ErrorMessage.USER_OR_PASSWORD_IS_WRONG);
    }
    return user;
  }

  async getUserInfoByUserName(userName: string): Promise<User> | undefined {
    const user: User = await this.userRepository.findOne({ where: { name: userName } });
    if (null === user) {
      return undefined;
    } else {
      return user;
    }
  }
}
