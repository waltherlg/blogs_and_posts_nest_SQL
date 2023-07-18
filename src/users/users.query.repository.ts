import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDBType, UserDocument, UserTypeOutput } from './users.types';
import { HydratedDocument, Model, Types } from 'mongoose';
import { PaginationOutputModel, RequestBannedUsersQueryModel } from '../models/types';
import { BlogDocument, Blog } from 'src/blogs/blogs.types';
import { PipelineStage } from 'mongoose';
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  private dataSource: DataSource) {}

  async getCurrentUserInfo(userId: string) {
    if (!isValidUUID(userId)) {
      return false;
    }
    const query = `
    SELECT email, login, "userId" 
    FROM public."Users"
    WHERE "userId"=$1
    LIMIT 1
    `
  const user = await this.dataSource.query(query, [userId])
  return user[0]  
  }

  async getUserById(userId): Promise<UserTypeOutput | null> {
    if (!isValidUUID(userId)) {
      return null;
    }
    const query = `
    SELECT "userId", login, email, "createdAt", "isBanned", "banDate", "banReason"
    FROM public."Users"
    WHERE "userId"=$1
    LIMIT 1
    `
  const userArr = await this.dataSource.query(query, [userId])
  const user = userArr[0]  
  return {
    id: user.userId,
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
    banInfo: {
      isBanned: user.isBanned,
      banDate: user.banDate,
      banReason: user.banReason,
    }
  }
  }

  async getAllUsers(mergedQueryParams): Promise<PaginationOutputModel<UserTypeOutput>> {
    const searchLoginTerm = mergedQueryParams.searchLoginTerm;
    const searchEmailTerm = mergedQueryParams.searchEmailTerm;
    const banStatus = mergedQueryParams.banStatus;
    const sortBy = mergedQueryParams.sortBy;
    
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = +mergedQueryParams.pageNumber;
    const pageSize = +mergedQueryParams.pageSize;
    const skipPage = (pageNumber - 1) * pageSize
  
const queryParams = [
  `%${searchLoginTerm}%`,
  `%${searchEmailTerm}%`,
  sortBy,    
  sortDirection.toUpperCase(),
  pageNumber,
  pageSize,
  skipPage,
];

let query = `
SELECT "userId", login, email, "createdAt", "isBanned", "banDate", "banReason"
FROM public."Users"
`;

let countQuery = `
SELECT COUNT(*)
FROM public."Users"
`;

if(searchLoginTerm !== '' || searchEmailTerm !== ''){
  query += `WHERE`
  countQuery += `WHERE`;
}

if (searchLoginTerm !== '') {
query += ` "login" ILIKE '${queryParams[0]}'`
countQuery += ` "login" ILIKE '${queryParams[0]}'`;
}

if (searchEmailTerm !== '') {
query += searchLoginTerm !== '' ? ` OR "email" ILIKE '${queryParams[1]}'` : ` "email" ILIKE '${queryParams[1]}'`
countQuery += searchLoginTerm !== '' ? ` OR "email" ILIKE '${queryParams[1]}'` : ` "email" ILIKE '${queryParams[1]}'`;
}

if((searchLoginTerm !== '' || searchEmailTerm !== '') && banStatus !== 'all'){
  query += `AND`
  countQuery += `AND`;
} 

if(banStatus !== 'all'){
  query += `WHERE`
  countQuery += `WHERE`;
}

if (banStatus === 'banned'){
  query += `"isBanned" = true`
  countQuery += `"isBanned" = true`
}

if (banStatus === 'notBanned'){
  query += `"isBanned" = false`
  countQuery += `"isBanned" = false`
}

query += ` ORDER BY "${queryParams[2]}" ${queryParams[3]}
LIMIT ${queryParams[5]} OFFSET ${queryParams[6]};
`;

// console.log('countQuery ', countQuery)
// console.log('query ', query)

const usersCountArr = await this.dataSource.query(countQuery);
const usersCount = parseInt(usersCountArr[0].count);

// console.log('usersCountArr ', usersCountArr)
// console.log('usersCount ', usersCount)

  const users = await this.dataSource.query(query);
    
    const outUsers = users.map((user) => {
      return {
        id: user.userId,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
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
