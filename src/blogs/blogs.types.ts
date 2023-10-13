
export class BlogDBType {
  constructor(
    public blogId: string,
    public name: string,
    public isBlogBanned: boolean,
    public blogBanDate: string | null,
    public userId: string | null,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,    
  ) {}
}

export type BannedBlogUsersType = {
  blogId: string,
  bannedUserId: string,
  banDate: string;
  banReason: string;
}

export type BlogTypeOutput = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type blogSaTypeOutput = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: blogOwnerInfoType;
  banInfo: blogBanInfoType;
};

type blogOwnerInfoType = {
  userId: string,
  userLogin: string,
};
type blogBanInfoType = {
  isBanned: string,
  banDate: string,
}


