import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
import { testUser, testUserPag } from './helpers/inputAndOutputObjects/usersObjects';
import { log } from 'console';

export function testSaUsersCrud() {
  describe('test sa users (e2e)', () => {
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

    const notExistingId = new Types.ObjectId();
    let userId1: string

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });
    afterAll(async () => {
      await app.close();
    });

    let createdBlogId: string;

    it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
      await request(app.getHttpServer())
        .delete(endpoints.wipeAllData)
        .expect(204);
    });

    it('01-01 sa/users GET = 200 return empty array with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('00-00 sa/users post = 201 create user1 with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUser.inputUser1)
        .expect(201);

        const createdResponseBody = createResponse.body;
        userId1 = createdResponseBody.id

        expect(createdResponseBody).toEqual(testUser.outputUser1);
    });

    it('01-01 sa/users GET = 200 return array with user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          testUser.outputUser1
        ],
      });
    });

    it('00-00 sa/users PUT = 204 ban user1', async () => {
      await request(app.getHttpServer())
        .put(`${endpoints.saUsers}/${userId1}/ban`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUser.inputBanUser)
        .expect(204);
    })

    it('01-01 sa/users GET = 200 return array with banned user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          testUser.outputUser1Banned
        ],
      });
    });

    it('00-00 sa/users PUT = 204 unban user1', async () => {
      await request(app.getHttpServer())
        .put(`${endpoints.saUsers}/${userId1}/ban`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUser.inputUnbanUser)
        .expect(204);
    })

    it('01-01 sa/users GET = 200 return array with unbanned user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          testUser.outputUser1
        ],
      });
    });

    it('00-00 sa/users PUT = 204 delete user1', async () => {
      await request(app.getHttpServer())
        .delete(`${endpoints.saUsers}/${userId1}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(204);
    })

    it('01-01 sa/users GET = 200 return empty array after deleting user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });  

  });
}
