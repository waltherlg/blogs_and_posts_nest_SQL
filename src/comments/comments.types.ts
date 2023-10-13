
export class CommentDBType {
  constructor(
    public commentId: string,
    public postId: string,
    public content: string,
    public createdAt: string,
    public userId: string,
    public likesCount: number,
    public dislikesCount: number,
  ) {}
}

type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};
type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
};
export type CommentTypeOutput = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: string;
  likesInfo: LikesInfoType;
};
