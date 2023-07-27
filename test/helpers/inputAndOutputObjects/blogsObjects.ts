
export let testInputBlogBody = {
blog1: {
    name: 'Blog1',
    description: 'Description1',
    websiteUrl: 'https://www.someweb.com',
  },
blog2: {
    name: 'Blog2',
    description: 'Description2',
    websiteUrl: 'https://www.someweb.com',
  },
blog3: {
    name: 'Blog3',
    description: 'Description3',
    websiteUrl: 'https://www.someweb.com',
  },
blog4: {
    name: 'Blog4',
    description: 'Description4',
    websiteUrl: 'https://www.someweb.com',
  },
}

export let testOutputBlogBody = {
  blog1: {
    id: expect.any(String),
    name: 'Blog1',
    description: 'Description1',
    websiteUrl: 'https://www.someweb.com',
    createdAt: expect.any(String),
    isMembership: false,
  },
  blog2: {
    id: expect.any(String),
    name: 'Blog2',
    description: 'Description2',
    websiteUrl: 'https://www.someweb.com',
    createdAt: expect.any(String),
    isMembership: false,
  },
  blog3: {
    id: expect.any(String),
    name: 'Blog3',
    description: 'Description3',
    websiteUrl: 'https://www.someweb.com',
    createdAt: expect.any(String),
    isMembership: false,
  },
  blog4: {
    id: expect.any(String),
    name: 'Blog4',
    description: 'Description4',
    websiteUrl: 'https://www.someweb.com',
    createdAt: expect.any(String),
    isMembership: false,
  },
}





















