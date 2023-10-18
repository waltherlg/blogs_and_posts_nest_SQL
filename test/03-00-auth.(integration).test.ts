import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
import { testUser } from './helpers/inputAndOutputObjects/usersObjects';
import { UsersRepository } from 'src/users/users.repository';
import { UserDBType } from 'src/users/users.types';
import { addAppSettings } from 'src/helpers/helpers';

const delay = async (ms: number) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
export function testAuthOperations() {
    describe('andpoints of auth.controller (e2e)', () => {
    let usersRepository: UsersRepository;
    let app: INestApplication;

    //const usersRepository = new UsersRepository();

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

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
        .send(testUser.inputUser1)
        .expect(204);
    });

    let confirmationCode1User1: string

    it('should call getConfirmationCodeOfLastCreatedUser', async () => {
      const user:UserDBType = await usersRepository.getLastCreatedUserDbType();
      confirmationCode1User1 = user.confirmationCode
      expect(confirmationCode1User1).not.toBeUndefined();
    });

    it('00-00 registration email resending = 204 resend email and change ConfirmationCode', async () => {     
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration-email-resending`)
        .send({email: testUser.inputUser1.email})
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

    let accessToken: any;

    it('00-00 login = 204 login user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send(testUser.loginUser1)
        .expect(200);
      const createdResponse = createResponse.body;
      accessToken = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
      expect(createResponse.headers['set-cookie']).toBeDefined();
      const refreshTokenCookie = createResponse.headers['set-cookie']
        .find((cookie) => cookie.startsWith('refreshToken='));
    
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('Secure');
    });

    let userId1

    it('get information of current user = 200 and login, email, id of user', async () => {
      const testsResponse = await request(app.getHttpServer())
        .get(`${endpoints.auth}/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const responseBody = testsResponse.body;
      userId1 = responseBody.userId;

      expect(responseBody).toEqual({
        login: testUser.inputUser1.login,
        email: testUser.inputUser1.email,
        userId: expect.any(String),
      });
    });

    it('password recovery via email = 204 and confirmUser', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/password-recovery`)
        .send({email: testUser.inputUser1.email})
        .expect(204);
    });

    let passwordRecoveryCode: string
    let passwordHash: string

    it('check that password recovery data in user is prepared and get recovery code', async () => {
      const user:UserDBType = await usersRepository.getLastCreatedUserDbType(); 
      passwordRecoveryCode = user.passwordRecoveryCode 
      passwordHash = user.passwordHash    
      expect(user.passwordRecoveryCode).not.toBe(null);
      expect(user.expirationDateOfRecoveryCode).not.toBe(null);
    });

    it('new password set = 204', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/new-password`)
        .send({newPassword: 'qwerty1',
               recoveryCode: passwordRecoveryCode})
        .expect(204);
    });

    let newPasswordHash: string

    it('check that password recovery in user is sucsess', async () => {
      const user:UserDBType = await usersRepository.getLastCreatedUserDbType();  
      newPasswordHash = user.passwordHash  
      expect(user.passwordHash).not.toBe(passwordHash)
      expect(user.passwordRecoveryCode).toBe(null);
      expect(user.expirationDateOfRecoveryCode).toBe(null);
    });

    describe('refresh-token', () => {

      let refreshTokenCookie
      let refreshTokenCookie2
      let refreshTokenNotValidCookie

      it('00-00 login = 204 login user with new password', async () => {
        const createResponse = await request(app.getHttpServer())
          .post(`${endpoints.auth}/login`)
          .send({
            loginOrEmail: "user1",
            password: "qwerty1"
        })
          .expect(200);
        const createdResponse = createResponse.body;
        //accessToken = createdResponse.accessToken;
        expect(createdResponse).toEqual({
          accessToken: expect.any(String),
        });
        expect(createResponse.headers['set-cookie']).toBeDefined();
  
        refreshTokenCookie = createResponse.headers['set-cookie']   
          .find((cookie) => cookie.startsWith('refreshToken='));
      
        expect(refreshTokenCookie).toBeDefined();
        expect(refreshTokenCookie).toContain('HttpOnly');
        expect(refreshTokenCookie).toContain('Secure');
      });
      
      it('00-00 refresh-token = 200 should get new access and refresh token', async () => {
      await delay(1000)
        const createResponse = await request(app.getHttpServer())
          .post(`${endpoints.auth}/refresh-token`)
          .set('Cookie', refreshTokenCookie)
          .expect(200);
         
        const createdResponse = createResponse.body;
       // accessToken = createdResponse.accessToken;
        expect(createdResponse).toEqual({
          accessToken: expect.any(String),
        });
        expect(createResponse.headers['set-cookie']).toBeDefined();
  
       refreshTokenCookie2 = createResponse.headers['set-cookie'] 
        .find((cookie) => cookie.startsWith('refreshToken='));
  
        expect(refreshTokenCookie2).toBeDefined();
        expect(refreshTokenCookie2).toContain('HttpOnly');
        expect(refreshTokenCookie2).toContain('Secure');
        expect(refreshTokenCookie2).not.toBe(refreshTokenCookie);     
      });  
      
      it('00-00 logout = 204 should logout', async () => {
        //await delay(1000)
          const createResponse = await request(app.getHttpServer())
            .post(`${endpoints.auth}/logout`)
            .set('Cookie', refreshTokenCookie2)
            .expect(204);
           
          const createdResponse = createResponse.body;
          expect(createResponse.headers['set-cookie']).toBeDefined();       
    
         refreshTokenNotValidCookie = createResponse.headers['set-cookie'] 
          .find((cookie) => cookie.startsWith('refreshToken='));
    
          expect(refreshTokenCookie2).toBeDefined();
          expect(refreshTokenNotValidCookie).not.toBe(refreshTokenCookie2);     
        }); 

        it('00-00 refresh-token = 401 should get 401 after logout', async () => {
          await delay(1000)
            const createResponse = await request(app.getHttpServer())
              .post(`${endpoints.auth}/refresh-token`)
              .set('Cookie', refreshTokenCookie2)
              .expect(401);    
          });  
      })



  });
}

