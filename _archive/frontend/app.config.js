import 'dotenv/config';

export default {
  expo: {
    name: "BrasseBouillon",
    slug: "brasse-bouillon",
    version: "1.0.0",
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};
