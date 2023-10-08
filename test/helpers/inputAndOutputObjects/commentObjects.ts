export let testComments = {
    inputUser1: {
        login: 'user1',
        password: 'qwerty',
        email: 'ruslan@gmail-1.com',
      },
    outputUser1:{
        id: expect.any(String),
        login: 'user1',
        email: 'ruslan@gmail-1.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
    },
    outputUser1Sa:{
        id: expect.any(String),
        login: 'user1',
        email: 'ruslan@gmail-1.com',
        createdAt: expect.any(String),
    },
    loginUser1: {
        loginOrEmail: 'user1',
        password: 'qwerty',  
    },

    inputUser2: {
        login: 'user2',
        password: 'qwerty',
        email: 'ruslan@gmail-2.com',
      },
    outputUser2:{
        id: expect.any(String),
        login: 'user2',
        email: 'ruslan@gmail-2.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
    },
    outputUser2Sa:{
        id: expect.any(String),
        login: 'user2',
        email: 'ruslan@gmail-2.com',
        createdAt: expect.any(String),
    },
    loginUser2: {
        loginOrEmail: 'user2',
        password: 'qwerty',  
    },

    inputUser3: {
        login: 'user3',
        password: 'qwerty',
        email: 'ruslan@gmail-3.com',
      },
    outputUser3:{
        id: expect.any(String),
        login: 'user3',
        email: 'ruslan@gmail-3.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
    },
    outputUser3Sa:{
        id: expect.any(String),
        login: 'user3',
        email: 'ruslan@gmail-3.com',
        createdAt: expect.any(String),
    },
    loginUser3: {
        loginOrEmail: 'user3',
        password: 'qwerty',  
    },

    inputUser4: {
        login: 'user4',
        password: 'qwerty',
        email: 'ruslan@gmail-4.com',
      },
    outputUser4:{
        id: expect.any(String),
        login: 'user4',
        email: 'ruslan@gmail-4.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
    },
    loginUser4: {
        loginOrEmail: 'user4',
        password: 'qwerty',  
    },

    inputUser5: {
        login: 'user5',
        password: 'qwerty',
        email: 'ruslan@gmail-5.com',
      },
    outputUser5:{
        id: expect.any(String),
        login: 'user5',
        email: 'ruslan@gmail-5.com',
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null 
        }
    },
    loginUser5: {
        loginOrEmail: 'user5',
        password: 'qwerty',  
    },

    inputBodyBlog1: {
        name: 'Blog1',
        description: 'Description1',
        websiteUrl: 'https://www.someweb.com',
    },
    outputBodyBlog1: {
        id: expect.any(String),
        name: 'Blog1',
        description: 'Description1',
        websiteUrl: 'https://www.someweb.com',
        createdAt: expect.any(String),
        isMembership: false,
      },

    inputBodyPost1forBlog1: {
        title: "title1forBlog1",
        shortDescription: "shortDescription1forBlog1",
        content: "content1forBlog1"
    },
    inputBodyPost2forBlog1: {
        title: "title2forBlog1",
        shortDescription: "shortDescription2forBlog1",
        content: "content2forBlog1"
    },

    outputPost1forBlog1: {
        id: expect.any(String),
        title: "title1forBlog1",
        shortDescription: "shortDescription1forBlog1",
        content: "content1forBlog1",
        blogId: expect.any(String),
        blogName: 'Blog1',
        createdAt: expect.any(String),
        extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: []
        }
    },
    outputPost2forBlog1: {
        id: expect.any(String),
        title: "title2forBlog1",
        shortDescription: "shortDescription2forBlog1",
        content: "content2forBlog1",
        blogId: expect.any(String),
        blogName: 'Blog1',
        createdAt: expect.any(String),
        extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: []
        }
    },
    inputComment1ForPost1FromUser1: {
        content: "Comment1ForPost1FromUser1"
    },
    ouputComment1ForPost1FromUser1: {
        id: expect.any(String),
        content: "Comment1ForPost1FromUser1",
        commentatorInfo: {
            userId: expect.any(String),
            userLogin: "user1"
        },
        createdAt: expect.any(String),
        likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None"
        }
    },
    inputComment1ForPost1FromUser2: {
        content: "Comment1ForPost1FromUser2"
    },
    ouputComment1ForPost1FromUser2: {
        id: expect.any(String),
        content: "Comment1ForPost1FromUser2",
        commentatorInfo: {
            userId: expect.any(String),
            userLogin: "user2"
        },
        createdAt: expect.any(String),
        likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None"
        }
    },
    inputComment1ForPost1FromUser3: {
        content: "Comment1ForPost1FromUser3"
    },
    ouputComment1ForPost1FromUser3: {
        id: expect.any(String),
        content: "Comment1ForPost1FromUser3",
        commentatorInfo: {
            userId: expect.any(String),
            userLogin: "user3"
        },
        createdAt: expect.any(String),
        likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: "None"
        }
    }

}