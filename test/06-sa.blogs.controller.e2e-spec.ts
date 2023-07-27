import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
import { testUser } from './helpers/inputAndOutputObjects/usersObjects';
import { testInputBlogBody, testOutputBlogBody } from './helpers/inputAndOutputObjects/blogsObjects';
export function saBlogsControllerCrudAndBan() {
  describe('andpoints of SA blogs.controller (e2e)', () => {
    let accessTokenUser1
    let accessTokenUser2
    let blogId1
    let blogId2
    let userId1
    let userId2
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

    let firstCreatedBlogId: string;
    let createdPostId: string;

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

    it('00-00 blogger/blogs POST = 201 user2 create blog2', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .send(testInputBlogBody.blog2)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      blogId2 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testOutputBlogBody.blog2);
    });

    it('00-00 /blogs GET = 200 get blog1 and blog2', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.blogs}`)
        .expect(200);
        const createdResponseBody = createResponse.body;
        expect(createdResponseBody).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [
            testOutputBlogBody.blog2,
            testOutputBlogBody.blog1],
      });
    });
    

    it('00-00 sa/blogs PUT = 204 sa ban blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.saBlogs}/${blogId1}/ban`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({isBanned: true})
        .expect(204);
    });

    it('00-00 /blogs GET = 200 get blog2 after ban blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.blogs}`)
        .expect(200);
        const createdResponseBody = createResponse.body;
        expect(createdResponseBody).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 1,
          items: [
            testOutputBlogBody.blog2],
      });
    });

    it('00-00 sa/blogs PUT = 204 sa unban blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.saBlogs}/${blogId1}/ban`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({isBanned: false})
        .expect(204);
    });

    it('00-00 /blogs GET = 200 get blog1 and blog2 after unban blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.blogs}`)
        .expect(200);
        const createdResponseBody = createResponse.body;
        expect(createdResponseBody).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [
            testOutputBlogBody.blog2,
            testOutputBlogBody.blog1],
      });
    });

  });
}
