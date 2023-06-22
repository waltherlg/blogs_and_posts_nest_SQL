

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
  inputUserAaa: {
    login: 'aaauser',
    password: 'qwerty',
    email: 'ruslan@gmail-aaa.com',
  },
  inputUserBbb: {
    login: 'bbbuser',
    password: 'qwerty',
    email: 'ruslan@gmail-bbb.com',
  },
  inputUserCcc: {
    login: 'cccuser',
    password: 'qwerty',
    email: 'ruslan@gmail-ccc.com',
  },
  inputUserDdd: {
    login: 'ddduser',
    password: 'qwerty',
    email: 'ruslan@gmail-ddd.com',
  },
  inputUserEee: {
    login: 'eeeuser',
    password: 'qwerty',
    email: 'ruslan@gmail-eee.com',
  },
  outputUserAaa:{
    id: expect.any(String),
    login: 'useraaa',
    email: 'ruslan@gmail-aaa.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUserBbb:{
    id: expect.any(String),
    login: 'userbbb',
    email: 'ruslan@gmail-bbb.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUserCcc:{
    id: expect.any(String),
    login: 'userccc',
    email: 'ruslan@gmail-ccc.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUserDdd:{
    id: expect.any(String),
    login: 'userddd',
    email: 'ruslan@gmail-ddd.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },
  outputUserEee:{
    id: expect.any(String),
    login: 'usereee',
    email: 'ruslan@gmail-eee.com',
    createdAt: expect.any(String),
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null
    }
  },

}