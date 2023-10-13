import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../../blogs/infrostracture/blogs.repository";
import { BlogActionResult } from "../../../blogs/helpers/blogs.enum.action.result";

export class SaDeleteBlogByIdFromUriCommand {
    constructor(public blogId: string){}
  }
  
  @CommandHandler(SaDeleteBlogByIdFromUriCommand)
  export class SaDeleteBlogByIdFromUriUseCase implements ICommandHandler<SaDeleteBlogByIdFromUriCommand> {
    constructor(private readonly blogsRepository: BlogsRepository) {}
  
    async execute(
      command: SaDeleteBlogByIdFromUriCommand,
    ): Promise<BlogActionResult> {
      const blog = await this.blogsRepository.getBlogDBTypeById(command.blogId);
      if(!blog) return BlogActionResult.BlogNotFound
      const result = await this.blogsRepository.deleteBlogById(command.blogId);
      if(result) {
        return BlogActionResult.Success
      } else { 
        return BlogActionResult.NotSaved
      }
  
    }
  }
  