import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async deleteAllData() {
    await this.dataSource.query(`
    DELETE FROM public."CommentLikes";
    DELETE FROM public."Comments";
    DELETE FROM public."PostLikes";
    DELETE FROM public."Posts";
    DELETE FROM public."BlogBannedUsers";
    DELETE FROM public."Blogs";
    DELETE FROM public."UserDevices";
    DELETE FROM public."Users";
     `)
    return true;
  }
}
