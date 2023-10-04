
export class PostLikeDbType {
    constructor(
        public postId: string,
        public addedAt: string,
        public userId: string,
        public login: string,
        public isUserBanned: boolean,
        public status: string,
    ) {}
}

export class CommentLikeDbType {
    constructor(
        public commentId: string,
        public addedAt: string,
        public userId: string,
        public login: string,
        public isUserBanned: boolean,
        public status: string,
    ) {}
}