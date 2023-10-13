import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserDBType } from './users.types';
import { PasswordRecoveryModel } from '../auth/auth.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class UsersRepository {
  constructor(
  @InjectDataSource() protected dataSource: DataSource) {}

  async createUser(userDTO): Promise<string> {
    const query = `INSERT INTO public."Users"(
      "userId", 
      login, 
      "passwordHash", 
      email, 
      "createdAt", 
      "isUserBanned", 
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
      RETURNING "userId"`;

    const result = await this.dataSource.query(query, [
      userDTO.userId,
      userDTO.login,
      userDTO.passwordHash,
      userDTO.email,
      userDTO.createdAt,
      userDTO.isUserBanned,
      userDTO.banDate,
      userDTO.banReason,
      userDTO.confirmationCode,
      userDTO.expirationDateOfConfirmationCode,
      userDTO.isConfirmed,
      userDTO.passwordRecoveryCode,
      userDTO.expirationDateOfRecoveryCode
    ])

    const userId = result[0].userId;
    return userId;
  }

  async getUserForLoginByLoginOrEmail(loginOrEmail: string){
    const query = `
    SELECT "userId" AS id, "isConfirmed", "isUserBanned", "passwordHash"
    FROM public."Users"
    WHERE email = $1 OR login = $1
    LIMIT 1
  `;
  const result = await this.dataSource.query(query, [loginOrEmail]); 
  return result[0];
  }

  async deleteUserById(userId: string): Promise<boolean> {
    if (!isValidUUID(userId)) {
      return false;
    }
    
    const query = `
    DELETE FROM public."Users"
    WHERE "userId" = $1
    `
    const result = await this.dataSource.query(query, [userId]);
    return result[1] > 0;   
  }

  async getUserDBTypeById(userId): Promise<UserDBType | null> {
    if (!isValidUUID(userId)) {
      return null;
    }
    const query = `
    SELECT * FROM public."Users"
    WHERE "userId" = $1
    `
    const result = await this.dataSource.query(query, [
      userId
    ]); 
    return result[0];
  }

  async addPasswordRecoveryData(
    passwordRecoveryData: PasswordRecoveryModel,
  ): Promise<boolean> {    
    
    const query = `
  UPDATE public."Users"
  SET "passwordRecoveryCode" = $2, "expirationDateOfRecoveryCode" = $3
  WHERE "email" = $1;
  `;
  try {
    await this.dataSource.query(query, [
      passwordRecoveryData.email,
      passwordRecoveryData.passwordRecoveryCode,
      passwordRecoveryData.expirationDateOfRecoveryCode
    ]);
    return true;
  } catch (error) {
    return false;
  }
  }

  async isPasswordRecoveryCodeExistAndNotExpired(confirmationCode:string): Promise<boolean>{
    const query = `
    SELECT COUNT(*) AS count
    FROM public."Users"
    WHERE "passwordRecoveryCode" = $1
    AND "expirationDateOfRecoveryCode" > NOW()
  `;
  const result = await this.dataSource.query(query, [confirmationCode]);
  const count = result[0].count;
  return count > 0;
  }

  async newPasswordSet(recoveryCode: string, newPasswordHash: string): Promise<boolean> {    
    const query = `
  UPDATE public."Users"
  SET "passwordHash" = $2, "passwordRecoveryCode" = null, "expirationDateOfRecoveryCode" = null
  WHERE "passwordRecoveryCode" = $1;
  `;
  try {
    await this.dataSource.query(query, [
      recoveryCode,
      newPasswordHash
    ]);
    return true;
  } catch (error) {
    return false;
  }
  }

  async confirmUser(confirmationCode: string): Promise<boolean>{
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

  async changeUserBanStatus(userBanDto): Promise<boolean> {
    if (!isValidUUID(userBanDto.userId)) {
      return false;
    }
    const query = `
    UPDATE public."Users"
    SET "isUserBanned" = $2, "banDate" = $3, "banReason" = $4 
    WHERE "userId" = $1;
    `
    try {
      await this.dataSource.query(query, [
        userBanDto.userId,
        userBanDto.isBanned,
        userBanDto.banDate,
        userBanDto.banReason
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
      WHERE login = $1
    `;
    const result = await this.dataSource.query(query, [login]);
    const count = result[0].count;
    return count > 0;
  }

  async isUserIdExist(userId: string): Promise<boolean> {
    if (!isValidUUID(userId)) {
      return false;
    }
    const query = `
      SELECT COUNT(*) AS count
      FROM public."Users"
      WHERE "userId" = $1
    `;
    const result = await this.dataSource.query(query, [userId]);
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

  async isConfirmationCodeExistAndNotExpired(confirmationCode:string){
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
  if (result.length > 0) {
    const isConfirmed = result[0].isConfirmed;
    return isConfirmed;
  }
  return false;   
  }

  async isUserBanned(userId): Promise<boolean>{
    if (!isValidUUID(userId)) {
      return false;
    }
    const query = `
    SELECT "isUserBanned"
    FROM public."Users"
    WHERE "userId"=$1
    LIMIT 1
    `
    const isUserBanned = await this.dataSource.query(query, [userId]);
    return isUserBanned[0].isUserBanned
  }

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
