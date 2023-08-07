import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UUID } from 'crypto';
import mongoose, { HydratedDocument, ObjectId, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export class PostDBType {
  constructor(
    public postId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public createdAt: string,
    public userId: string,
    public likesCount: number,
    public dislikesCount: number
  ) {}
}

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: Types.ObjectId;
  @Prop()
  title: string;
  @Prop()
  shortDescription: string;
  @Prop()
  content: string;
  @Prop()
  userId: string;
  @Prop()
  isBanned: boolean;
  @Prop()
  blogId: string;
  @Prop()
  blogName: string;
  @Prop()
  isBlogBanned: boolean;
  @Prop()
  createdAt: string;
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
  @Prop()
  likesCollection: Array<likesCollectionType>;
  countLikesAndDislikes() {
    return this.likesCollection!.reduce(
      (acc, post) => {
        if (post.isUserBanned === false && post.status === 'Like') {
          acc.likesCount++;
        } else if (post.isUserBanned === false && post.status === 'Dislike') {
          acc.dislikesCount++;
        }
        return acc;
      },
      { likesCount: 0, dislikesCount: 0 },
    );
  }
  getNewestLikes() {
    return this.likesCollection
      .filter((n) => n.status === 'Like' && n.isUserBanned === false)
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      .slice(0, 3);
  }

  preparePostForOutput() {
    const LikesAndDislikes = this.countLikesAndDislikes();
    const newestLikes = this.getNewestLikes();
    const newestLikesForOutput = newestLikes.map((like) => {
      return {
        addedAt: like.addedAt,
        login: like.login,
        userId: like.userId,
      };
    });

    return {
      id: this._id.toString(),
      title: this.title,
      shortDescription: this.shortDescription,
      content: this.content,
      blogId: this.blogId,
      blogName: this.blogName,
      createdAt: this.createdAt,
      extendedLikesInfo: {
        likesCount: LikesAndDislikes.likesCount,
        dislikesCount: LikesAndDislikes.dislikesCount,
        myStatus: this.myStatus,
        newestLikes: newestLikesForOutput,
      },
    };
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.methods = {
  countLikesAndDislikes: Post.prototype.countLikesAndDislikes,
  getNewestLikes: Post.prototype.getNewestLikes,
  preparePostForOutput: Post.prototype.preparePostForOutput,
};

export type PostTypeOutput = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfoType;
};

type extendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: Array<newestLikesOutputType>;
};

type likesCollectionType = {
  addedAt: string;
  userId: string;
  login: string;
  isUserBanned: boolean;
  status: string;
};

type newestLikesOutputType = {
  addedAt: string;
  login: string;
  userId: string;
};
