

export let testUser = {
    inputBanUser: {
        isBanned: true,
        banReason: 'some ban or unban reason'
    },
    inputUnbanUser: {
        isBanned: false,
        banReason: 'some ban or unban reason'
    },    
    inputUser1: {
        login: 'user1',
        password: 'qwerty',
        email: 'ruslan@gmail-1.com',
      },
      inputUser2: {
        login: 'user2',
        password: 'qwerty',
        email: 'ruslan@gmail-2.com',
      },
      inputUser3: {
        login: 'user3',
        password: 'qwerty',
        email: 'ruslan@gmail-3.com',
      },
      inputUser4: {
        login: 'user4',
        password: 'qwerty',
        email: 'ruslan@gmail-4.com',
      },
      inputUser5: {
        login: 'user5',
        password: 'qwerty',
        email: 'ruslan@gmail-5.com',
      },
    
    loginUser1: {
            loginOrEmail: 'user1',
            password: 'qwerty',  
    },
    loginUser2: {
        loginOrEmail: 'user2',
        password: 'qwerty',  
    },
    loginUser3: {
        loginOrEmail: 'user3',
        password: 'qwerty',  
    },
    loginUser4: {
        loginOrEmail: 'user4',
        password: 'qwerty',  
    },
    loginUser5: {
        loginOrEmail: 'user5',
        password: 'qwerty',  
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
    outputUser1Banned:{
      id: expect.any(String),
      login: 'user1',
      email: 'ruslan@gmail-1.com',
      createdAt: expect.any(String),
      banInfo: {
        isBanned: true,
        banDate: expect.any(String),
        banReason: expect.any(String)
      }
    }

}

export let testUserPag = {
  inputUseraaabbbccc: {
    login: 'aaabbbccc',
    password: 'qwerty',
    email: 'dddddd@gemeil.com',
  },
  inputUsereeefffggg: {
    login: 'eeefffggg',
    password: 'qwerty',
    email: 'hhhhhh@gemeil.com',
  },
  inputUseriiijjjkkk: {
    login: 'iiijjjkkk',
    password: 'qwerty',
    email: 'llllll@gemeil.com',
  },
  inputUsermmmnnnooo: {
    login: 'mmmnnnooo',
    password: 'qwerty',
    email: 'pppppp@gemeil.com',
  },
  inputUserqqqrrrsss: {
    login: 'qqqrrrsss',
    password: 'qwerty',
    email: 'tttttt@gemeil.com',
  },
  outputUseraaabbbccc:{
    id: expect.any(String),
    login: 'aaabbbccc',
    email: 'dddddd@gemeil.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUsereeefffggg:{
    id: expect.any(String),
    login: 'eeefffggg',
    email: 'hhhhhh@gemeil.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUseriiijjjkkk:{
    id: expect.any(String),
    login: 'iiijjjkkk',
    email: 'llllll@gemeil.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUsermmmnnnooo:{
    id: expect.any(String),
    login: 'mmmnnnooo',
    email: 'pppppp@gemeil.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUserqqqrrrsss:{
    id: expect.any(String),
    login: 'qqqrrrsss',
    email: 'tttttt@gemeil.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },

}