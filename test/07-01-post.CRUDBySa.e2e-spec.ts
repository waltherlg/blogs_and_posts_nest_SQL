import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
import { testUser } from './helpers/inputAndOutputObjects/usersObjects';
import { testInputBlogBody, testOutputBlogBody } from './helpers/inputAndOutputObjects/blogsObjects';
import { testPosts } from './helpers/inputAndOutputObjects/postsObjects';
export function postCrudOperationsBySa07() {
  describe('post CRUD operation (e2e)', () => {
    let accessTokenUser1
    let accessTokenUser2
    let blogId1
    let blogId2
    let userId1
    let userId2
    let postId1
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

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

 
    it('00-01 sa/users post = 201 create user1 with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUser.inputUser1)
        .expect(201);

        const createdResponseBody = createResponse.body;
        userId1 = createdResponseBody.id

        expect(createdResponseBody).toEqual(testUser.outputUser1Sa);
    });

    it('00-02 sa/users post = 201 create user2 with return', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(endpoints.saUsers)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testUser.inputUser2)
        .expect(201);

        const createdResponseBody = createResponse.body;
        userId2 = createdResponseBody.id

        expect(createdResponseBody).toEqual(testUser.outputUser2Sa);
    });

    it('00-03 login = 204 login user1', async () => {
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

    it('00-04 login = 204 login user2', async () => {
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

    it('00-05 blogger/blogs POST = 201 user1 create blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testPosts.inputBodyBlog1)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      blogId1 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testPosts.outputBodyBlog1);
    });

    it('00-07 blogger/blogs/{blogId}/posts POST = 201 user1 create post1 for blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}/${blogId1}/posts`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testPosts.inputBodyPost1forBlog1)
        .expect(201);
      const createdResponseBody = createResponse.body;     
      postId1 = createdResponseBody.id;
      expect(createdResponseBody).toEqual(testPosts.outputPost1forBlog1);
    });

    it('00-08 blogger/blogs/{blogId}/posts/{postId} PUT = 204 user1 update post1 for blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.bloggerBlogs}/${blogId1}/posts/${postId1}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testPosts.inputBodyPost2forBlog1)
        .expect(204);
    });

    it('00-09 posts/{postId} GET = get post1 after update', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${postId1}`)
        .expect(200);
        const createdResponseBody = createResponse.body;     
        expect(createdResponseBody).toEqual(testPosts.outputPost2forBlog1);
    });

    it('00-10 /posts GET = 200 return post1 with pagination', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(endpoints.posts)
        .expect(200);
      const createdResponse = createResponse.body;

      expect(createdResponse).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          testPosts.outputPost2forBlog1
        ],
      });
    });

    it('00-11 blogger/blogs/{blogId}/posts/{postId} DELETE = 204 user1 delete post1 for blog1', async () => {
      const createResponse = await request(app.getHttpServer())
        .delete(`${endpoints.bloggerBlogs}/${blogId1}/posts/${postId1}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send(testPosts.inputBodyPost2forBlog1)
        .expect(204);
    });

    it('00-09 posts/{postId} GET = 404 not found post1 after delete', async () => {
      const createResponse = await request(app.getHttpServer())
        .get(`${endpoints.posts}/${postId1}`)
        .expect(404);
    });


  });
}
