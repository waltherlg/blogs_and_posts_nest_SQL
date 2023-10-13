import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrostracture/blogs.repository';
import { validateOrReject } from 'class-validator';

const validateOrRejectModel = async (model: any, ctor: { new (): any }) => {
  if (model instanceof ctor === false) {
    throw new Error('Incorrect input data');
  }
  try {
    await validateOrReject(model);
  } catch (error) {
    throw new Error(error);
  }
};

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async deleteBlogById(blogsId: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlogById(blogsId);
  }
}
