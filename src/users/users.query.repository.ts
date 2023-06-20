import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserTypeOutput } from './users.types';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PaginationOutputModel, RequestBannedUsersQueryModel } from '../models/types';
import { BlogDocument, Blog } from 'src/blogs/blogs.types';
import { PipelineStage } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  private dataSource: DataSource) {}

  async getCurrentUserInfo(userId: string) {
    const query = `
    SELECT email, login, id AS "userId" 
    FROM public."Users"
    WHERE id=$1
    LIMIT 1
    `
  const user = await this.dataSource.query(query, [userId])
  return user[0]  
  }

  async getUserById(userId): Promise<UserTypeOutput | null> {

    const query = `
    SELECT id, login, email, "createdAt"
    FROM public."Users"
    WHERE id=$1
    LIMIT 1
    `
  const user = await this.dataSource.query(query, [userId])
  return user[0]  
  }
  

  async getAllUsers(mergedQueryParams): Promise<PaginationOutputModel<UserTypeOutput>> {
    const searchLoginTerm = `%${mergedQueryParams.searchLoginTerm}%`;
    const searchEmailTerm = `%${mergedQueryParams.searchEmailTerm}%`;
    const banStatus = mergedQueryParams.banStatus;
    const sortBy = mergedQueryParams.sortBy;
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = +mergedQueryParams.pageNumber;
    const pageSize = +mergedQueryParams.pageSize;
  
    const query = `
      SELECT id, login, email, "isBanned", "banDate", "banReason"
      FROM public."Users"
      WHERE (login ILIKE $1 OR email ILIKE $2)
      AND ($3 = 'all' OR "isBanned" = ($3 = 'banned'))
      ORDER BY $4, $5
      LIMIT $6 OFFSET $7
    `;
  
    const queryParams = [
      `%${searchLoginTerm}%`,
      `%${searchEmailTerm}%`,
      banStatus,
      sortBy,
      sortDirection,
      pageSize,
      (pageNumber - 1) * pageSize,
      
    ];
  
    const users = await this.dataSource.query(query, queryParams);
    const usersCount = users.length; // Вместо countDocuments() в SQL мы просто получаем все записи
    console.log(users)
  
    const outUsers = users.map((user) => {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      };
    });
  
    const pageCount = Math.ceil(usersCount / pageSize);
  
    const outputUsers: PaginationOutputModel<UserTypeOutput> = {
      pagesCount: pageCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: usersCount,
      items: outUsers,
    };
  
    return outputUsers;
  }

  async getBannedUsersForCurrentBlog(userId: string, blogId: string, mergedQueryParams: RequestBannedUsersQueryModel) {
    const sortByField = `bannedUsers.${mergedQueryParams.sortBy}`;
  
    const aggregationPipeline: PipelineStage[] = [
      { $match: { _id: new Types.ObjectId(blogId) } },
      { $project: { _id: 0, bannedUsers: 1 } },
      { $unwind: "$bannedUsers" },
      { $match: { "bannedUsers.login": { $regex: mergedQueryParams.searchLoginTerm || "", $options: "i" } } },
      { $sort: { [sortByField]: this.sortByDesc(mergedQueryParams.sortDirection) } },
      { $skip: this.skipPage(mergedQueryParams.pageNumber, mergedQueryParams.pageSize) },
      { $limit: +mergedQueryParams.pageSize },
      {
        $group: {
          _id: null,
          bannedUsers: { $push: "$bannedUsers" }
        }
      },
    ];
  
    const [result] = await this.blogModel.aggregate(aggregationPipeline);
    const users = result ? result.bannedUsers : [];
  
    const usersCountPipeline: PipelineStage[] = [
      { $match: { _id: new Types.ObjectId(blogId) } },
      { $unwind: "$bannedUsers" },
      { $match: { "bannedUsers.login": { $regex: mergedQueryParams.searchLoginTerm || "", $options: "i" } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ];
    const [countResult] = await this.blogModel.aggregate(usersCountPipeline);
    const usersCount = countResult ? countResult.count : 0;
  
    const outUsers = users.map((user) => {
      return {
        id: user.id,
        login: user.login,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        }
      }
    });
    const pageCount = Math.ceil(usersCount / +mergedQueryParams.pageSize);
  
    const outputUsers: PaginationOutputModel<UserTypeOutput> = {
      pagesCount: pageCount,
      page: +mergedQueryParams.pageNumber,
      pageSize: +mergedQueryParams.pageSize,
      totalCount: usersCount,
      items: outUsers,
    };
    return outputUsers;
  }

  sortByDesc(sortDirection: string) {
    return sortDirection === 'desc' ? -1 : 1;
  }

  skipPage(pageNumber: string, pageSize: string): number {
    return (+pageNumber - 1) * +pageSize;
  }
}
