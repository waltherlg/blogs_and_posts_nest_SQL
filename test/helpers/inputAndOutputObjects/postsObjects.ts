


export let testPosts = {
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
    // inputBodyPost3forBlog1: {
    //     title: "title3forBlog1forBlog1",
    //     shortDescription: "shortDescription3forBlog1",
    //     content: "content3forBlog1"
    // },
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
    }

}