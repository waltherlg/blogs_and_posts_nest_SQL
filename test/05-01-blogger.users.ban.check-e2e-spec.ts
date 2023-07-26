import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
//import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
import { testUser, testUserPag } from './helpers/inputAndOutputObjects/usersObjects';
import { log } from 'console';
import { testInputBlogBody, testOutputBlogBody } from './helpers/inputAndOutputObjects/blogsObjects';
import { testBloggerBanBody } from './helpers/inputAndOutputObjects/usersObjects';

export function testBanUserForBlogByBlogger() {

  let accessTokenUser1
  let accessTokenUser2
  let blogId1
  let userId1
  let userId2

  describe('test Ban User For Blog By Blogger (e2e)', () => {
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

    const notExistingId = new Types.ObjectId();

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

    it('00-00 sa/users post = 201 create user2 with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUser.inputUser2)
        .expect(201);

        const createdResponseBody = createResponse.body;
        userId2 = createdResponseBody.id

        expect(createdResponseBody).toEqual(testUser.outputUser2);
    });

    it('00-00 login = 204 login user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send(testUser.loginUser1)
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser1 = createdResponse.accessToken;
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

    it('00-00 login = 204 login user2', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send(testUser.loginUser2)
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser2 = createdResponse.accessToken;
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

    it('00-00 blogger/blogs POST = 201 user1 create blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(testInputBlogBody.blog1)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      blogId1 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testOutputBlogBody.blog1);
    });

    it('00-00 blogger/users/:userId/ban PUT = 204 user1 ban user2 for blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.bloggerUsers}/${userId2}/ban`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
            isBanned: true,
            banReason: "some reason for ban user for this blog",
            blogId: blogId1
          })
        .expect(204);
    });

    it('00-00 blogger/users/blog/:blogId GET = 200 array of banned users for blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.bloggerUsers}/blog/${blogId1}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .expect(200);
      const createdResponseBody = createResponse.body; 
      expect(createdResponseBody).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          testBloggerBanBody.bannedUser2ForBlogOutput
        ],
      });
    });



  });
}
