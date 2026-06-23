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
  super_admin: Array<roleInterF>;
  common: Array<roleInterF>;
}

interface roleModuleConfigInterF {
  user: boolean;
  payment: boolean;
  test: boolean;
  question: boolean;
  compiler: boolean;
  super_admin: boolean;
  common: boolean;
}

interface roleConfigInterF {
  super_admin: roleModuleConfigInterF;
  admin: roleModuleConfigInterF;
  user: roleModuleConfigInterF;
}

// users and their defined permissions
export const roleConfig: roleConfigInterF = {
  super_admin: {
    user: true,
    test: true,
    payment: true,
    question: true,
    compiler: true,
    super_admin: true,
    common: true,
  },
  admin: {
    user: true,
    test: true,
    payment: true,
    question: true,
    compiler: true,
    super_admin: false,
    common: true,
  },
  user: {
    user: false,
    test: true,
    payment: false,
    question: true,
    compiler: true,
    super_admin: false,
    common: true,
  },
};

// defined all apis that require authorization
export const roleApiConfig: roleApiConfigInterF = {
  user: [
    { url: "/user/find-users", method: "post" },
    { url: "/user/create-user", method: "post" },
    { url: "/user/update-user", method: "patch" },
    { url: "/user/organisation", method: "patch" },
  ],
  test: [
    { url: "/test/getalltest", method: "post" },
    { url: "/test/verifyEmail", method: "post" },
    { url: "/test/create", method: "post" },
    { url: "/test/MultiLinkcreate", method: "post" },
    { url: "/test/resendEmail/:id", method: "get" },
    { url: "/test/testsCount", method: "get" },
    { url: "/test/shortlist", method: "post" },
    { url: "/test/:id", method: "get" },
    { url: "/test/UserINFO/:id", method: "post" },
    { url: "/test/MultiLinkTestDetails/:id", method: "post" },
    { url: "/test/getPresignedURL", method: "post" },
    { url: "/test/savePerodicAnswer", method: "post" },
    { url: "/test/submit", method: "post" },
    { url: "/test/answer/:testId", method: "get" },
    { url: "/test/started/:testId", method: "post" },
    { url: "/test/endtest/:testId", method: "post" },
    { url: "/test/mood", method: "post" },
    { url: "/test/updateCognitoOrganization", method: "post" },
    { url: "/test/getOrgDetails", method: "post" },
    { url: "/test/checkUserInDB", method: "post" },
    { url: "/test/verifyEmail", method: "post" },
    { url: "/test/logOut", method: "post" },
  ],
    question: [
    { url: "/questions", method: "get" },
    { url: "/questions/getQuestion", method: "post" },
    { url: "/questions/createCustomQuestion", method: "post" },
    { url: "/questions/updateCustomQuestion/:id", method: "patch" },
    { url: "/questions/custom-question-find", method: "post" },
    { url: "/questions/:id", method: "get" },
    { url: "/questions/previewCustomQuestion", method: "post" },
    { url: "/questions/finalizeDraft/:id", method: "patch" },
    { url: "/questions/saveDraft", method: "post" },
    ],
  payment: [
    { url: "/payment/createSubscription", method: "post" },
    { url: "/payment/subscription/status", method: "post" },
    { url: "/payment/getAllplans", method: "get" },
    { url: "/payment/getPlan/:planId", method: "get" },
    { url: "/payment/getSubscriptionDetails", method: "get" },
    { url: "/payment/getPaymentDetails", method: "get" },
    { url: "/payment/updateSubscriptionDetails", method: "patch" },
    { url: "/payment/cancelSubscription", method: "post" },
    { url: "/payment/createOrder", method: "post" },
  ],
  compiler: [
    { url: "/compiler/questions", method: "get" },
    { url: "/compiler/questionDetails/:id", method: "get" },
    { url: "/compiler/compileCode", method: "post" },
  ],
  super_admin: [
    { url: "/super-admin/getAllOrganizations", method: "post" },
    { url: "/super-admin/organization/:id", method: "get" },
    { url: "/super-admin/organization/:id/users", method: "post" },
    { url: "/super-admin/organization/:id/questions", method: "post" },
    { url: "/super-admin/organization/:id/tests", method: "post" },
    { url: "/super-admin/organization/:id/payments", method: "post" },
    { url: "/super-admin/organization/:id/subscription", method: "post" },
    { url: "/super-admin/getAllPayments", method: "post" },
    { url: "/super-admin/pricing", method: "patch" },
  ],
  common: [{ url: "/super-admin/pricing", method: "get" }],
};

export const allowedSuperAdminDomains = ["code-b.dev"];
