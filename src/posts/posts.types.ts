
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

type newestLikesOutputType = {
  addedAt: string;
  login: string;
  userId: string;
};
