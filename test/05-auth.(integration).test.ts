import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
import { userTest } from './helpers/inputAndOutputObjects/usersObjects';
import { UsersRepository } from 'src/users/users.repository';
import { UserDBType } from 'src/users/users.types';
import { addAppSettings } from 'src/helpers/helpers';
export function testAuthOperations() {
  describe('andpoints of auth.controller (e2e)', () => {
    let usersRepository: UsersRepository;
    let app: INestApplication;

    //const usersRepository = new UsersRepository();

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

    const notExistingId = new Types.ObjectId();

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      usersRepository = moduleFixture.get<UsersRepository>(UsersRepository);

      app = moduleFixture.createNestApplication();
      app = addAppSettings(app)
      await app.init();
    });
    afterAll(async () => {
      await app.close();
    });    

    // let firstCreatedBlogId: string;
    // let createdPostId: string;

    // it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
    //   await request(app.getHttpServer())
    //     .delete(endpoints.wipeAllData)
    //     .expect(204);
    // });

    // it('00-00 registration = 204 register new user', async () => {
    //   await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/registration`)
    //     .send(userTest.inputUser1)
    //     .expect(201);
    // });

    // let confirmationCode1User1: string

    // it('should call getConfirmationCodeOfLastCreatedUser', async () => {
    //   const user:UserDBType = await usersRepository.getLastCreatedUserDbType();
    //   confirmationCode1User1 = user.confirmationCode
    //   expect(confirmationCode1User1).not.toBeUndefined();
    //   console.log(confirmationCode1User1);
    // });

    // it('00-00 registration email resending = 204 resend email and change ConfirmationCode', async () => {     
    //   await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/registration-email-resending`)
    //     .send({email: userTest.inputUser1.email})
    //     .expect(204);
    // });

    // let confirmationCode2User1: string

    // it('check that ConfirmationCode in user document is changed', async () => {
    //   const user:UserDBType = await usersRepository.getLastCreatedUserDbType();
    //   confirmationCode2User1 = user.confirmationCode
    //   expect(confirmationCode2User1).not.toBe(confirmationCode1User1);
    // });

    // it('registration confirmation = 204 and confirmUser', async () => {
    //   await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/registration-confirmation`)
    //     .send({code: confirmationCode2User1})
    //     .expect(204);
    // });

    // it('check that user is confirmed', async () => {
    //   const user:UserDBType = await usersRepository.getLastCreatedUserDbType();      
    //   expect(user.confirmationCode).toBe(null);
    //   expect(user.expirationDateOfConfirmationCode).toBe(null);
    //   expect(user.isConfirmed).toBe(true);
    // });

    // let accessToken: any;

    // it('00-00 login = 204 login user', async () => {
    //   const createResponse = await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/login`)
    //     .send(userTest.loginUser1)
    //     .expect(200);
    //   const createdResponse = createResponse.body;
    //   accessToken = createdResponse.accessToken;
    //   expect(createdResponse).toEqual({
    //     accessToken: expect.any(String),
    //   });
    //   expect(createResponse.headers['set-cookie']).toBeDefined();
    //   const refreshTokenCookie = createResponse.headers['set-cookie']
    //     .find((cookie) => cookie.startsWith('refreshToken='));
    
    //   expect(refreshTokenCookie).toBeDefined();
    //   expect(refreshTokenCookie).toContain('HttpOnly');
    //   expect(refreshTokenCookie).toContain('Secure');
    // });

    // let userId1

    // it('get information of current user = 200 and login, email, id of user', async () => {
    //   const testsResponse = await request(app.getHttpServer())
    //     .get(`${endpoints.auth}/me`)
    //     .set('Authorization', `Bearer ${accessToken}`)
    //     .expect(200);

    //   const responseBody = testsResponse.body;
    //   userId1 = responseBody.userId;

    //   expect(responseBody).toEqual({
    //     login: userTest.inputUser1.login,
    //     email: userTest.inputUser1.email,
    //     userId: expect.any(String),
    //   });
    // });

    // it('password recovery via email = 204 and confirmUser', async () => {
    //   await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/password-recovery`)
    //     .send({email: userTest.inputUser1.email})
    //     .expect(204);
    // });

    // let passwordRecoveryCode: string
    // let passwordHash: string

    // it('check that password recovery data in user is prepared and get recovery code', async () => {
    //   const user:UserDBType = await usersRepository.getLastCreatedUserDbType(); 
    //   passwordRecoveryCode = user.passwordRecoveryCode 
    //   passwordHash = user.passwordHash    
    //   expect(user.passwordRecoveryCode).not.toBe(null);
    //   expect(user.expirationDateOfRecoveryCode).not.toBe(null);
    // });

    // it('new password set = 204', async () => {
    //   await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/new-password`)
    //     .send({newPassword: 'qwerty1',
    //            recoveryCode: passwordRecoveryCode})
    //     .expect(204);
    // });

    // let newPasswordHash: string

    // it('check that password recovery in user is sucsess', async () => {
    //   const user:UserDBType = await usersRepository.getLastCreatedUserDbType();  
    //   newPasswordHash = user.passwordHash  
    //   expect(user.passwordHash).not.toBe(passwordHash)
    //   expect(user.passwordRecoveryCode).toBe(null);
    //   expect(user.expirationDateOfRecoveryCode).toBe(null);
    // });

    // let refreshTokenCookie

    // it('00-00 login = 204 login user with new password', async () => {
    //   const createResponse = await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/login`)
    //     .send({
    //       loginOrEmail: "user1",
    //       password: "qwerty1"
    //   })
    //     .expect(200);
    //   const createdResponse = createResponse.body;
    //   accessToken = createdResponse.accessToken;
    //   expect(createdResponse).toEqual({
    //     accessToken: expect.any(String),
    //   });
    //   expect(createResponse.headers['set-cookie']).toBeDefined();
    //   refreshTokenCookie = createResponse.headers['set-cookie']
    //     .find((cookie) => cookie.startsWith('refreshToken='));
    
    //   expect(refreshTokenCookie).toBeDefined();
    //   expect(refreshTokenCookie).toContain('HttpOnly');
    //   expect(refreshTokenCookie).toContain('Secure');
    // });

    let accessToken
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzhmNzcxNy03OTQyLTRjN2ItYjZkNy01YjVhMTFhZjAxMWUiLCJkZXZpY2VJZCI6IjU2ZGEzOWE2LWNjNjMtNGI3MS1iMDI4LWNiNDIzMjAzNTk1OSIsImlhdCI6MTY4NzA4OTI0OSwiZXhwIjoxNjg3MTc1NjQ5fQ.f0Zw4QaRiMvYcMcI1dlkr8QYudFojaTXUDeFrhcynxU'

    let refreshTokenCookie2

    it('00-00 refresh-token = 200 should get new access and refresh token', async () => {
      //console.log('refreshTokenCookie ', refreshTokenCookie);
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/refresh-token`)
        .set('Cookie', `refreshToken=${token}`)
        .expect(200);
        //.set('Cookie', 'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YzhmNzcxNy03OTQyLTRjN2ItYjZkNy01YjVhMTFhZjAxMWUiLCJkZXZpY2VJZCI6IjYxYjE3MDdmLTBhN2EtNDVlMy05ZTUyLWM4NDdjMzAzMjYwYiIsImlhdCI6MTY4NzA3Njk3MiwiZXhwIjoxNjg3MTYzMzcyfQ.NEM8Krvxqgay-r3xPPjTOTxDm8yBS1RXdf7YwGdIq9U; Path=/;')
        
      const createdResponse = createResponse.body;
      accessToken = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
      expect(createResponse.headers['set-cookie']).toBeDefined();
      refreshTokenCookie2 = createResponse.headers['set-cookie']
        .find((cookie) => cookie.startsWith('refreshToken='));
    
      expect(refreshTokenCookie2).toBeDefined();
      // expect(refreshTokenCookie2).toContain('HttpOnly');
      // expect(refreshTokenCookie2).toContain('Secure');
      // expect(refreshTokenCookie2).not.toBe(refreshTokenCookie);

    });

    
  });
}
