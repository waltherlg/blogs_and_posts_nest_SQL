import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
import { userTest } from './helpers/inputAndOutputObjects/usersObjects';
import { UsersRepository } from 'src/users/users.repository';
import { UserDBType } from 'src/users/users.types';
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
      await app.init();
    });
    afterAll(async () => {
      await app.close();
    });    

    let firstCreatedBlogId: string;
    let createdPostId: string;

    it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
      await request(app.getHttpServer())
        .delete(endpoints.wipeAllData)
        .expect(204);
    });

    it('00-00 registration = 204 register new user', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration`)
        .send(userTest.inputUser1)
        .expect(201);
    });

    let confirmationCode1User1: string

    it('should call getConfirmationCodeOfLastCreatedUser', async () => {
      const user:UserDBType = await usersRepository.getLastCreatedUserDbType();
      confirmationCode1User1 = user.confirmationCode
      expect(confirmationCode1User1).not.toBeUndefined();
      console.log(confirmationCode1User1);
    });

    it('00-00 registration email resending = 204 resend email and change ConfirmationCode', async () => {     
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration-email-resending`)
        .send({email: userTest.inputUser1.email})
        .expect(204);
    });

    let confirmationCode2User1: string

    it('check that ConfirmationCode in user document is changed', async () => {
      const user:UserDBType = await usersRepository.getLastCreatedUserDbType();
      confirmationCode2User1 = user.confirmationCode
      expect(confirmationCode2User1).not.toBe(confirmationCode1User1);
    });

    it('registration confirmation = 204 and confirmUser', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration-confirmation`)
        .send({code: confirmationCode2User1})
        .expect(204);
    });

    it('check that user is confirmed', async () => {
      const user:UserDBType = await usersRepository.getLastCreatedUserDbType();      
      expect(user.confirmationCode).toBe(null);
      expect(user.expirationDateOfConfirmationCode).toBe(null);
      expect(user.isConfirmed).toBe(true);
    });

    it('00-00 login = 204 login user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send(userTest.loginUser1)
        .expect(200);
      // const createdResponse = createResponse.body;
      // accessToken = createdResponse.accessToken;
      // expect(createdResponse).toEqual({
      //   accessToken: expect.any(String),
      // });
      // expect(createResponse.headers['set-cookie']).toBeDefined();
      // const refreshTokenCookie = createResponse.headers['set-cookie']
      //   .find((cookie) => cookie.startsWith('refreshToken='));
    
      // expect(refreshTokenCookie).toBeDefined();
      // expect(refreshTokenCookie).toContain('HttpOnly');
      // expect(refreshTokenCookie).toContain('Secure');
    });

    
    

    let accessToken: any;

    // it('00-00 login = 204 login user', async () => {
    //   const createResponse = await request(app.getHttpServer())
    //     .post(`${endpoints.auth}/login`)
    //     .send({
    //       loginOrEmail: 'ruslan',
    //       password: 'qwerty',
    //     })
    //     .expect(200);
    //   const createdResponse = createResponse.body;
    //   accessToken = createdResponse.accessToken;
    //   expect(createdResponse).toEqual({
    //     accessToken: expect.any(String),
    //   });
    // });

    
  });
}
