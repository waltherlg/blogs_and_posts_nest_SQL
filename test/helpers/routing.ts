export const endpoints = {
  wipeAllData: '/testing/all-data',
// 
//  bloggerBlogs: '/blogger/blogs',
//  bloggerUsers: '/blogger/users',
  bloggerBlogs: '/sa/blogs',
  bloggerUsers: '/sa/users',

  comments: '/comments',
  saUsers: '/sa/users',
  saBlogs: '/sa/blogs',
  blogs: '/blogs',
  posts: '/posts',
  auth: '/auth',
  devices: '/security/devices',
};

export const delayFunction = async (ms: number) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
