interface roleInterF {
  url: string;
  method: string;
}

interface roleApiConfigInterF {
  user: Array<roleInterF>;
  payment: Array<roleInterF>;
  test: Array<roleInterF>;
  question: Array<roleInterF>;
  compiler: Array<roleInterF>;
}

interface roleModuleConfigInterF {
  user: boolean;
  payment: boolean;
  test: boolean;
  question: boolean;
  compiler: boolean;
}

interface roleConfigInterF {
  admin: roleModuleConfigInterF;
  user: roleModuleConfigInterF;
}

// users and their defined permissions
export const roleConfig: roleConfigInterF = {
  admin: {
    user: true,
    test: true,
    payment: true,
    question: true,
    compiler: true,
  },
  user: {
    user: false,
    test: true,
    payment: false,
    question: true,
    compiler: true,
  },
};

// defined all apis that require authorization
export const roleApiConfig: roleApiConfigInterF = {
  user: [
    { url: '/user/find-users', method: 'post' },
    { url: '/user/create-user', method: 'post' },
    { url: '/user/update-user', method: 'patch' },
    { url: '/user/organisation', method: 'patch' },
  ],
  test: [
    { url: '/test/getalltest', method: 'post' },
    { url: '/test/verifyEmail', method: 'post' },
    { url: '/test/create', method: 'post' },
    { url: '/test/MultiLinkcreate', method: 'post' },
    { url: '/test/resendEmail/:id', method: 'get' },
    { url: '/test/testsCount', method: 'get' },
    { url: '/test/shortlist', method: 'post' },
    { url: '/test/:id', method: 'get' },
    { url: '/test/UserINFO/:id', method: 'post' },
    { url: '/test/MultiLinkTestDetails/:id', method: 'post' },
    { url: '/test/getPresignedURL', method: 'post' },
    { url: '/test/savePerodicAnswer', method: 'post' },
    { url: '/test/submit', method: 'post' },
    { url: '/test/answer/:testId', method: 'get' },
    { url: '/test/started/:testId', method: 'post' },
    { url: '/test/endtest/:testId', method: 'post' },
    { url: '/test/mood', method: 'post' },
    { url: '/test/updateCognitoOrganization', method: 'post' },
    { url: '/test/getOrgDetails', method: 'post' },
    { url: '/test/checkUserInDB', method: 'post' },
    { url: '/test/verifyEmail', method: 'post' },
    { url: '/test/logOut', method: 'post' },
  ],
  question: [
    { url: '/questions/getQuestion', method: 'post' },
    { url: '/questions/createCustomQuestion', method: 'post' },
    { url: '/questions/updateCustomQuestion/:id', method: 'patch' },
    { url: '/questions/custom-question-find', method: 'post' },
    { url: '/questions/:id', method: 'get' },
  ],
  payment: [
    { url: '/payment/createSubscription', method: 'post' },
    { url: '/payment/subscription/status', method: 'post' },
    { url: '/payment/getAllplans', method: 'get' },
    { url: '/payment/getPlan/:planId', method: 'get' },
    { url: '/payment/getSubscriptionDetails', method: 'get' },
    { url: '/payment/getPaymentDetails', method: 'get' },
    { url: '/payment/updateSubscriptionDetails', method: 'patch' },
  ],
  compiler: [
    { url: '/compiler/questions', method: 'get' },
    { url: '/compiler/questionDetails/:id', method: 'get' },
    { url: '/compiler/compileCode', method: 'post' },
  ],
};
