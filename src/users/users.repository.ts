import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './users.types';
import { PasswordRecoveryModel } from '../auth/auth.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { log } from 'console';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, 
  @InjectDataSource() protected dataSource: DataSource) {}

  async saveUser(user: UserDocument): Promise<boolean> {
    const result = await user.save();
    return !!result;
  }

  async createUser(userDTO): Promise<string> {
    console.log(userDTO)
    const query = `INSERT INTO public."Users"(
      id, 
      login, 
      "passwordHash", 
      email, 
      "createdAt", 
      "isBanned", 
      "banDate", 
      "banReason", 
      "confirmationCode", 
      "expirationDateOfConfirmationCode", 
      "isConfirmed", 
      "passwordRecoveryCode", 
      "expirationDateOfRecoveryCode")
      VALUES (
      $1, 
      $2, 
      $3, 
      $4, 
      $5, 
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13)
      RETURNING id`;

    const result = await this.dataSource.query(query, [
      userDTO.id,
      userDTO.login,
      userDTO.passwordHash,
      userDTO.email,
      userDTO.createdAt,
      userDTO.isBanned,
      userDTO.banDate,
      userDTO.banReason,
      userDTO.confirmationCode,
      userDTO.expirationDateOfConfirmationCode,
      userDTO.isConfirmed,
      userDTO.passwordRecoveryCode,
      userDTO.expirationDateOfRecoveryCode
    ])

    const userId = result[0].id.toString();
    return userId;
  }

  async deleteUserById(userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    return this.userModel.findByIdAndDelete(userId);
  }

  async getUserDBTypeById(userId): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }
    return user;
  }

  async deleteAllUsers() {
    await this.userModel.deleteMany({});
  }
  async getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.userModel.findOne({
      confirmationCode: code,
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.userModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
    return user;
  }

  async updateConfirmation(code: string) {
    const result = await this.userModel.updateOne(
      { code },
      {
        $set: {
          isConfirmed: true,
          confirmationCode: null,
          expirationDateOfConfirmationCode: null,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async refreshConfirmationCode(refreshConfirmationData: any) {
    
    const result = await this.userModel.updateOne(
      { email: refreshConfirmationData.email },
      {
        $set: {
          confirmationCode: refreshConfirmationData.confirmationCode,
          expirationDate: refreshConfirmationData.expirationDate,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async addPasswordRecoveryData(
    passwordRecoveryData: PasswordRecoveryModel,
  ): Promise<boolean> {
    const user = await this.userModel.findOne({
      email: passwordRecoveryData.email,
    });
    user.passwordRecoveryCode = passwordRecoveryData.passwordRecoveryCode;
    user.expirationDateOfRecoveryCode =
      passwordRecoveryData.expirationDateOfRecoveryCode;
    const result = user.save();
    return !!result;
  }

  async newPasswordSet(_id: Types.ObjectId, passwordHash: string) {
    if (!Types.ObjectId.isValid(_id)) {
      return null;
    }
    const user = await this.userModel.findById(_id);
    const result = await this.userModel.updateOne(
      { _id: _id },
      {
        $set: {
          passwordHash: passwordHash,
          passwordRecoveryCode: null,
          expirationDateOfRecoveryCode: null,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async createCommentsLikeObject(
    userId: string,
    commentsId: string,
    createdAt: Date,
    status: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const _id = new Types.ObjectId(userId);
    const user = await this.userModel.findOne({ _id: _id });
    if (!user) {
      return false;
    }
    const newLikedComment = { commentsId, createdAt, status };
    user.likedComments.push(newLikedComment);
    const result = await user.save();
    return !!result;
  }

  async isUserAlreadyLikeComment(
    userId: string,
    commentsId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const _id = new Types.ObjectId(userId);
    const isExist = await this.userModel.findOne({
      _id: _id,
      likedComments: { $elemMatch: { commentsId: commentsId } },
    });
    return !!isExist;
  }

  async updateCommentsLikeObject(
    userId: string,
    commentsId: string,
    status: string,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }
    const _id = new Types.ObjectId(userId);
    const updateStatus = await this.userModel.findOneAndUpdate(
      { _id: _id, 'likedComments.commentsId': commentsId },
      { $set: { 'likedComments.$.status': status } },
    );
    return true;
  }

  async getUsersLikedComments(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    const _id = new Types.ObjectId(userId);
    const user = await this.userModel.findOne({ _id: _id });
    if (!user) return null;
    return user.likedComments;
  }

  async confirmUser(confirmationCode: string){
    const query = `
    UPDATE public."Users"
    SET "confirmationCode"=null, "expirationDateOfConfirmationCode"=null, "isConfirmed"=true
    WHERE "confirmationCode" = $1;
    `;
    try {
      await this.dataSource.query(query, [
        confirmationCode
      ]);
  
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshConfirmationData(refreshConfirmationData){
    const query = `
    UPDATE public."Users"
    SET "confirmationCode"=$1, "expirationDateOfConfirmationCode"=$2
    WHERE email = $3;
    `
    try {
      await this.dataSource.query(query, [
        refreshConfirmationData.confirmationCode,
        refreshConfirmationData.expirationDateOfConfirmationCode,
        refreshConfirmationData.email
      ]);
  
      return true;
    } catch (error) {
      return false;
    }
  }

  async isEmailExists(email: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) AS count
      FROM public."Users"
      WHERE email = $1
    `;
    const result = await this.dataSource.query(query, [email]);
    const count = result[0].count;
    return count > 0;
  }

  async isEmailConfirmed(email: string): Promise<boolean> {
    const query = `
      SELECT "isConfirmed"
      FROM public."Users"
      WHERE email = $1
    `;
    const result = await this.dataSource.query(query, [email]);
    return result;
  }

  async isLoginExists(login: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) AS count
      FROM public."Users"
      WHERE email = $1
    `;
    const result = await this.dataSource.query(query, [login]);
    const count = result[0].count;
    return count > 0;
  }

  async isPasswordRecoveryCodeExist(passwordRecoveryCode: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) AS count
      FROM public."Users"
      WHERE "passwordRecoveryCode" = $1
    `;
    const result = await this.dataSource.query(query, [passwordRecoveryCode]);
    const count = result[0].count;
    return count > 0;
  }

  async isConfirmationCodeIsValid(confirmationCode:string){
    const query = `
    SELECT COUNT(*) AS count
    FROM public."Users"
    WHERE "confirmationCode" = $1
    AND "expirationDateOfConfirmationCode" > NOW()
  `;
  const result = await this.dataSource.query(query, [confirmationCode]);
  const count = result[0].count;
  return count > 0;
  }

  
  async isEmailAlreadyCofirmed(email: string): Promise<boolean>{
    const query = `
    SELECT "isConfirmed"
    FROM public."Users"
    WHERE email=$1
    LIMIT 1
    `
  const result = await this.dataSource.query(query, [email]);
  console.log(result[0])
  if (result.length > 0) {
    const isConfirmed = result[0].isConfirmed;
    return isConfirmed;
  }
  return false;
    
  }

  async getUserByPasswordRecoveryCode(code: string) {
    const user: UserDocument = await this.userModel.findOne({
      passwordRecoveryCode: code,
    });
    if (!user) {
      return null;
    }
    return user;
  };

  async getConfirmationCodeOfLastCreatedUser(){
    const result = await this.dataSource.query(`SELECT "confirmationCode"
FROM "Users"
ORDER BY "createdAt" DESC
LIMIT 1;`)
return result[0];
    }

  async getLastCreatedUserDbType(){
    const result = await this.dataSource.query(`SELECT *
  FROM "Users"
  ORDER BY "createdAt" DESC
  LIMIT 1;`)
  return result[0];
      }
  
}
