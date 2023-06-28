import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
import { testUser, testUserPag } from './helpers/inputAndOutputObjects/usersObjects';
import { log } from 'console';

export function testSaUsersGetWithPagination() {
  describe('sa users getting with pagination (e2e)', () => {
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

    it('00-00 sa/users post = 201 create user mmmnnnooo with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUserPag.inputUsermmmnnnooo)
        .expect(201);

        const createdResponseBody = createResponse.body;

        expect(createdResponseBody).toEqual(testUserPag.outputUsermmmnnnooo);
  });

  it('00-00 sa/users post = 201 create user eeefffggg with return', async () => {
    const createResponse = await request(app.getHttpServer())
      .post(endpoints.saUsers)
      .set('Authorization', `Basic ${basicAuthRight}`)
      .send(testUserPag.inputUsereeefffggg)
      .expect(201);

      const createdResponseBody = createResponse.body;

      expect(createdResponseBody).toEqual(testUserPag.outputUsereeefffggg);
});

it('00-00 sa/users post = 201 create user aaabbbccc with return', async () => {
  const createResponse = await request(app.getHttpServer())
    .post(endpoints.saUsers)
    .set('Authorization', `Basic ${basicAuthRight}`)
    .send(testUserPag.inputUseraaabbbccc)
    .expect(201);

    const createdResponseBody = createResponse.body;

    expect(createdResponseBody).toEqual(testUserPag.outputUseraaabbbccc);
});

    it('00-00 sa/users post = 201 create user qqqrrrsss with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUserPag.inputUserqqqrrrsss)
        .expect(201);
  
        const createdResponseBody = createResponse.body;
  
        expect(createdResponseBody).toEqual(testUserPag.outputUserqqqrrrsss);
  });

    it('00-00 sa/users post = 201 create user iiijjjkkk with return', async () => {
        const createResponse = await request(app.getHttpServer())
          .post(endpoints.saUsers)
          .set('Authorization', `Basic ${basicAuthRight}`)
          .send(testUserPag.inputUseriiijjjkkk)
          .expect(201);
  
          const createdResponseBody = createResponse.body;
  
          expect(createdResponseBody).toEqual(testUserPag.outputUseriiijjjkkk);
    });

    it('00-00 sa/users post = 201 create user aaafffkkk with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUserPag.inputUseraaafffkkk)
        .expect(201);

        const createdResponseBody = createResponse.body;

        expect(createdResponseBody).toEqual(testUserPag.outputUseraaafffkkk);
  });

it('01-01 sa/users GET = 200 return array with 5 users by createdAt desc', async () => {
  const createResponse = await request(app.getHttpServer())
    .get(endpoints.saUsers)
    .set('Authorization', `Basic ${basicAuthRight}`)
    .expect(200);
  const createdResponseBody = createResponse.body;

  expect(createdResponseBody).toEqual({
    pagesCount: 1,
    page: 1,
    pageSize: 10,
    totalCount: 6,
    items: [
testUserPag.outputUseraaafffkkk,      
testUserPag.outputUseriiijjjkkk,
testUserPag.outputUserqqqrrrsss,
testUserPag.outputUseraaabbbccc,
testUserPag.outputUsereeefffggg,
testUserPag.outputUsermmmnnnooo,
    ],
  });
});

it('01-01 sa/users GET = 200 return array with 5 users by login ASC', async () => {
  const createResponse = await request(app.getHttpServer())
    .get(endpoints.saUsers)
    .query({ sortBy: 'login', sortDirection: 'asc'})
    .set('Authorization', `Basic ${basicAuthRight}`)
    .expect(200);
  const createdResponseBody = createResponse.body;

  expect(createdResponseBody).toEqual({
    pagesCount: 1,
    page: 1,
    pageSize: 10,
    totalCount: 6,
    items: [
      testUserPag.outputUseraaabbbccc,
      testUserPag.outputUseraaafffkkk,
      testUserPag.outputUsereeefffggg,
      testUserPag.outputUseriiijjjkkk,
      testUserPag.outputUsermmmnnnooo,
      testUserPag.outputUserqqqrrrsss,                 
    ],
  });
});

it('01-01 sa/users GET = 200 return with 2 users by searchLoginTerm "aaa" ASC', async () => {
  const createResponse = await request(app.getHttpServer())
    .get(endpoints.saUsers)
    .query({searchLoginTerm: 'aaa', sortBy: 'login', sortDirection: 'asc'})
    .set('Authorization', `Basic ${basicAuthRight}`)
    .expect(200);
  const createdResponseBody = createResponse.body;

  expect(createdResponseBody).toEqual({
    pagesCount: 1,
    page: 1,
    pageSize: 10,
    totalCount: 2,
    items: [
      testUserPag.outputUseraaabbbccc,
      testUserPag.outputUseraaafffkkk,                 
    ],
  });
});




    

  });
}
