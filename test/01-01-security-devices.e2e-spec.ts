import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
import { testUser } from './helpers/inputAndOutputObjects/usersObjects';
import { UsersRepository } from 'src/users/users.repository';
import { UserDBType } from 'src/users/users.types';
import { addAppSettings } from 'src/helpers/helpers';
import { testUserDevice } from './helpers/inputAndOutputObjects/userDevicesObjects';

const delay = async (ms: number) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
export function testSecurityDevices() {
    describe('test Security Devices (e2e)', () => {
    let usersRepository: UsersRepository;
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');
    let accessToken
    let refreshTokenCookie
    let userDeviceId1

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

    it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
      await request(app.getHttpServer())
        .delete(endpoints.wipeAllData)
        .expect(204);
    });

    it('00-00 sa/users post = 201 create user1 with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUser.inputUser1)
        .expect(201);

        const createdResponseBody = createResponse.body;

        expect(createdResponseBody).toEqual(testUser.outputUser1);
    });

    it('00-00 login = 204 1 login user', async () => {
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
      refreshTokenCookie = createResponse.headers['set-cookie']
        .find((cookie) => cookie.startsWith('refreshToken='));
    
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('Secure');
    });

    it('00-00 login = 204 2 login user', async () => {
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

    it('00-00 login = 204 3 login user', async () => {
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

    it('00-00 login = 204 4 login user', async () => {
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
      refreshTokenCookie = createResponse.headers['set-cookie']
        .find((cookie) => cookie.startsWith('refreshToken='));
    
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('Secure');
    });

    it('00-00 security/devices GET = 200 return 4 device of user1', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoints.devices)
        .set('Cookie', refreshTokenCookie)
        .expect(200);
      const responseBody = response.body;

      userDeviceId1 = responseBody[0].deviceId

      expect(responseBody).toEqual([
        testUserDevice.anyOutputDevice,
        testUserDevice.anyOutputDevice,
        testUserDevice.anyOutputDevice,
        testUserDevice.anyOutputDevice,
      ]);
    });

    it('00-00 security/devices/{:deviceId} DELETE = 204 return 4 device of user1', async () => {
      const response = await request(app.getHttpServer())
        .delete(`${endpoints.devices}/${userDeviceId1}`)
        .set('Cookie', refreshTokenCookie)
        .expect(204);
    });

    it('00-00 security/devices GET = 200 return 3 deviceы of user1 after deleting one', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoints.devices)
        .set('Cookie', refreshTokenCookie)
        .expect(200);
      const responseBody = response.body;

      userDeviceId1 = responseBody[0].deviceId

      expect(responseBody).toEqual([
        testUserDevice.anyOutputDevice,
        testUserDevice.anyOutputDevice,
        testUserDevice.anyOutputDevice,
      ]);
    });

    it('00-00 security/devices DELETE = 204 terminate all session exclude current', async () => {
      const response = await request(app.getHttpServer())
        .delete(endpoints.devices)
        .set('Cookie', refreshTokenCookie)
        .expect(204);
    });

    it('00-00 security/devices GET = 200 return 1 device of user1 after terminate all session exclude current', async () => {
      const response = await request(app.getHttpServer())
        .get(endpoints.devices)
        .set('Cookie', refreshTokenCookie)
        .expect(200);
      const responseBody = response.body;

      expect(responseBody).toEqual([
        testUserDevice.anyOutputDevice,
      ]);
    });


  });
}

