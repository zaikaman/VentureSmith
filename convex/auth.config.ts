
export default {
  providers: [
    {
      domain: process.env.VITE_CONVEX_SITE_URL,
      applicationID: 'convex',
    },
    {
      domain: process.env.SITE_URL,
      applicationID: 'convex',
    },
  ],
};
