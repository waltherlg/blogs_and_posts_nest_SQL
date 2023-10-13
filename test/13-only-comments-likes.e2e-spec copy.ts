import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { endpoints } from './helpers/routing';
export function onlyCommentLikesCrud13() {
  describe('Post Likes Crud CRUD operation \"if all is ok\" (e2e). ', () => {
    let app: INestApplication;

    const basicAuthRight = Buffer.from('admin:qwerty').toString('base64');
    const basicAuthWrongPassword =
      Buffer.from('admin:12345').toString('base64');
    const basicAuthWrongLogin = Buffer.from('12345:qwerty').toString('base64');

    let accessTokenUser1: any;
    let accessTokenUser2: any;
    let accessTokenUser3: any;
    let accessTokenUser4: any;
    let accessTokenUser5: any;
    

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

    let BlogId1User1: string;
    let createdPostId: string;
    let createdCommentId: string;

    it('00-00 testing/all-data DELETE = 204 removeAllData', async () => {
      await request(app.getHttpServer())
        .delete(endpoints.wipeAllData)
        .expect(204);
    });

    it('00-00 auth/registration = 204 register user1', async () => {
      await request(app.getHttpServer())
        .post(`${endpoints.auth}/registration`)
        .send({
          login: 'user1',
          password: 'qwerty',
          email: 'ruslan@gmail-1.com',
        })
        .expect(204);
    });

    it('00-00 login user1 = 204 login user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`${endpoints.auth}/login`)
        .send({
          loginOrEmail: 'user1',
          password: 'qwerty',
        })
        .expect(200);
      const createdResponse = createResponse.body;
      accessTokenUser1 = createdResponse.accessToken;
      expect(createdResponse).toEqual({
        accessToken: expect.any(String),
      });
    });

    it('01-02 blogger/blogs POST = 201 SA create new blog', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(endpoints.bloggerBlogs)
        //.set('Authorization', `Bearer ${accessTokenUser1}`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        .send({
          name: 'BlogForPosts',
          description: 'description BlogForPosts',
          websiteUrl: 'https://www.someweb.com',
        })
        .expect(201);

      const createdResponseOfFirstBlog = testsResponse.body;
      BlogId1User1 = createdResponseOfFirstBlog.id;

      expect(createdResponseOfFirstBlog).toEqual({
        id: BlogId1User1,
        name: 'BlogForPosts',
        description: 'description BlogForPosts',
        websiteUrl: 'https://www.someweb.com',
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('01-02 blogger/blogId/posts POST = 201 sa create new post', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.bloggerBlogs}/${BlogId1User1}/posts`)
        //.post(`${endpoints.posts}/${createdPostId}/comments`)
        .set('Authorization', `Basic ${basicAuthRight}`)
        //.set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          title: 'newCreatedPost',
          shortDescription: 'newPostsShortDescription',
          content: 'some content',
        })
        .expect(201);

      const createdResponse = testsResponse.body;
      createdPostId = createdResponse.id;

      expect(createdResponse).toEqual({
        id: expect.any(String),
        title: 'newCreatedPost',
        shortDescription: 'newPostsShortDescription',
        content: 'some content',
        blogId: BlogId1User1,
        blogName: 'BlogForPosts',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    it('01-02 posts/postId/comments POST = 201 user1 create new comment', async () => {
      const testsResponse = await request(app.getHttpServer())
        .post(`${endpoints.posts}/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          content: 'some comment for post1',
        })
        .expect(201);

      const createdResponse = testsResponse.body;
      createdCommentId = createdResponse.id;

      expect(createdResponse).toEqual({
        id: expect.any(String),
        content: 'some comment for post1',
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: 'user1',
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('01-06 /comments/commentId/like-status UPDATE = 204 like from user1', async () => {
      const createResponse = await request(app.getHttpServer())
        .put(`${endpoints.comments}/${createdCommentId}/like-status`)
        .set('Authorization', `Bearer ${accessTokenUser1}`)
        .send({
          likeStatus: 'Like',
        })
        .expect(204);
    });
  });
}