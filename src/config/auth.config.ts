export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-prod',
    expiresIn: process.env.JWT_EXPIRATION || '86400s', // 24h
  },
};
