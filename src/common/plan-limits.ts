export const PLAN_LIMITS = {
  free: {
    tests: parseInt(process.env.FREE_TESTS || '20', 10),
    users: parseInt(process.env.FREE_USERS || '3', 10),
    customQuestions: parseInt(process.env.FREE_CUSTOM_QUESTIONS || '0', 10),
  },
  paid: {
    tests: parseInt(process.env.TOTAL_TEST_INCREMENT || '100', 10),
    users: parseInt(process.env.TOTAL_USER_INCREMENT || '10', 10),
    customQuestions: parseInt(process.env.PAID_CUSTOM_QUESTIONS || '20', 10),
  },
};