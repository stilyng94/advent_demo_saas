module.exports = {
  apps: [
    {
      name: "api",
      script: "./dist/index.js",
      autorestart: true,
      instances: "1",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
