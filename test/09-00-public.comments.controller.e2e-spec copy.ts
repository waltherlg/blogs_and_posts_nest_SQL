import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { endpoints } from './helpers/routing';
import { testUser } from './helpers/inputAndOutputObjects/usersObjects';
import { testInputBlogBody, testOutputBlogBody } from './helpers/inputAndOutputObjects/blogsObjects';
import { testComments } from './helpers/inputAndOutputObjects/commentObjects';
export function commentCrudOperations() {
  describe('comment CRUD operation (e2e)', () => {
    let accessTokenUser1
    let accessTokenUser2
    let accessTokenUser3
    let blogId1
    let blogId2
    let userId1
    let userId2
    let postId1
    let commentId1
    let commentId2
    let commentId3
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
        .send(testComments.inputUser1)
        .expect(201);

        const createdResponseBody = createResponse.body;
        userId1 = createdResponseBody.id

        expect(createdResponseBody).toEqual(testComments.outputUser1);
    });

    it('00-00 login = 204 login user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send(testComments.loginUser1)
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser1 = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
      expect(createResponse.headers['set-cookie']).toBeDefined();
    });

    it('00-00 sa/users post = 201 create user2 with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testComments.inputUser2)
        .expect(201);

        const createdResponseBody = createResponse.body;
        userId2 = createdResponseBody.id

        expect(createdResponseBody).toEqual(testComments.outputUser2);
    });

    it('00-00 login = 204 login user2', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send(testComments.loginUser2)
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser2 = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
      expect(createResponse.headers['set-cookie']).toBeDefined();
    });

    it('00-00 sa/users post = 201 create user3 with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testComments.inputUser3)
        .expect(201);

        const createdResponseBody = createResponse.body;
        userId2 = createdResponseBody.id

        expect(createdResponseBody).toEqual(testComments.outputUser3);
    });

    it('00-00 login = 204 login user3', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send(testComments.loginUser3)
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser3 = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
      expect(createResponse.headers['set-cookie']).toBeDefined();
    });

    it('00-00 blogger/blogs POST = 201 user1 create blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(testComments.inputBodyBlog1)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      blogId1 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testComments.outputBodyBlog1);
    });

    it('00-00 blogger/blogs/{blogId}/posts POST = 201 user1 create post1 for blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}/${blogId1}/posts`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(testComments.inputBodyPost1forBlog1)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      postId1 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testComments.outputPost1forBlog1);
    });

    it('00-00 posts/{postId}/comments POST = 201 user1 create comment1 for post1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.posts}/${postId1}/comments`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send(testComments.inputComment1ForPost1FromUser1)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      commentId1 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testComments.ouputComment1ForPost1FromUser1);
    });

    // it('00-00 posts/{postId}/comments POST = 201 user1 create comment1 for post1', async () => {
    //   const createResponse = await request(app.getHttpServer())
    //     .post(`${endpoints.posts}/${postId1}/comments`)
    //     .set('Authorization', `Bearer ${accessTokenUser1}`)
    //     .send(testComments.inputComment1ForPost1FromUser1)
    //     .expect(201);
    //   const createdResponseBody = createResponse.body;     
    //   commentId1 = createdResponseBody.id;
    //   expect(createdResponseBody).toEqual(testComments.ouputComment1ForPost1FromUser1);
    // });

    it('00-00 posts/{postId}/comments POST = 201 user2 create comment1 for post1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.posts}/${postId1}/comments`)
        .set('Authorization', `Bearer ${accessTokenUser2}`)
        .send(testComments.inputComment1ForPost1FromUser2)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      commentId2 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testComments.ouputComment1ForPost1FromUser2);
    });

    it('00-00 posts/{postId}/comments POST = 201 user3 create comment1 for post1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.posts}/${postId1}/comments`)
        .set('Authorization', `Bearer ${accessTokenUser3}`)
        .send(testComments.inputComment1ForPost1FromUser3)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      commentId3 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testComments.ouputComment1ForPost1FromUser3);
    });

    it('00-00 posts/{postId}/comments GET = 201 unauth user get comments for post1', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${postId1}/comments`)
        .expect(200);
      const createdResponseBody = createResponse.body;     
      expect(createdResponseBody).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          testComments.ouputComment1ForPost1FromUser3,
          testComments.ouputComment1ForPost1FromUser2,
          testComments.ouputComment1ForPost1FromUser1
        ]
      });
    });



  });
}
