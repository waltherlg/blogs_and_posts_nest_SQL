import { Injectable } from '@nestjs/common';
import { NewCreatedUserTypeOutput, UserTypeOutput } from './users.types';
import { PaginationOutputModel, RequestBannedUsersQueryModel } from '../models/types';
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class UsersQueryRepository {
  constructor(
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
    SELECT "userId", login, email, "createdAt", "isUserBanned", "banDate", "banReason"
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
      isBanned: user.isUserBanned,
      banDate: user.banDate,
      banReason: user.banReason,
    }
  }
  }

  async getNewCreatedUserById(userId): Promise<NewCreatedUserTypeOutput | null> {
    if (!isValidUUID(userId)) {
      return null;
    }
    const query = `
    SELECT "userId", login, email, "createdAt"
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
    createdAt: user.createdAt
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
SELECT "userId", login, email, "createdAt", "isUserBanned", "banDate", "banReason"
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
  query += `"isUserBanned" = true`
  countQuery += `"isUserBanned" = true`
}

if (banStatus === 'notBanned'){
  query += `"isUserBanned" = false`
  countQuery += `"isUserBanned" = false`
}

query += ` ORDER BY "${queryParams[2]}" ${queryParams[3]}
LIMIT ${queryParams[5]} OFFSET ${queryParams[6]};
`;

const usersCountArr = await this.dataSource.query(countQuery);
const usersCount = parseInt(usersCountArr[0].count);

  const users = await this.dataSource.query(query);
    
    const outUsers = users.map((user) => {
      return {
        id: user.userId,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
        banInfo: {
          isBanned: user.isUserBanned,
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

  async getBannedUsersForCurrentBlog(blogId: string, mergedQueryParams: RequestBannedUsersQueryModel) {
    const searchLoginTerm = mergedQueryParams.searchLoginTerm;
    const sortBy = mergedQueryParams.sortBy;   
    const sortDirection = mergedQueryParams.sortDirection;
    const pageNumber = +mergedQueryParams.pageNumber;
    const pageSize = +mergedQueryParams.pageSize;
    const skipPage = (pageNumber - 1) * pageSize

    const queryParams = [
      `%${searchLoginTerm}%`,
      sortBy,    
      sortDirection.toUpperCase(),
      pageNumber,
      pageSize,
      skipPage,
      blogId
    ];

    let query = `
    SELECT "BlogBannedUsers".*, "Users".login
    FROM public."BlogBannedUsers"
    INNER JOIN "Users"
    ON "BlogBannedUsers"."bannedUserId" = "Users"."userId"
    WHERE "blogId" = '${queryParams[6]}'
    `
    let countQuery = `
    SELECT COUNT(*)
    FROM public."BlogBannedUsers"
    INNER JOIN "Users"
    ON "BlogBannedUsers"."bannedUserId" = "Users"."userId"
    WHERE "blogId" = '${queryParams[6]}'
    `;
    if (searchLoginTerm !== ''){
      query += `AND login ILIKE '${queryParams[0]}'`
      countQuery += `AND login ILIKE '${queryParams[0]}'`;
    }

    query += ` ORDER BY "${queryParams[1]}" ${queryParams[2]}
    LIMIT ${queryParams[4]} OFFSET ${queryParams[5]};
    `;

    const bannedUsersCountArr = await this.dataSource.query(countQuery);
    const bannedUsersCount = parseInt(bannedUsersCountArr[0].count);

    const bannedUsers = await this.dataSource.query(query);
    

    const bannedUsersForOutput = bannedUsers.map(user => {
      return {
        id: user.bannedUserId,
        login: user.login,
        banInfo: {
          isBanned: true,
          banDate: user.banDate,
          banReason: user.banReason
        }
      }
    })

    const pageCount = Math.ceil(bannedUsersCount / pageSize);

    const outputBannedUsers = {
      pagesCount: pageCount,
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: bannedUsersCount,
      items: bannedUsersForOutput
    };
    return outputBannedUsers;


  

  }
}
