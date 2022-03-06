module.exports = {
  apps: [
    {
      name: "one-time-link",
      script: "./dist/server.js",
      watch: ["dist"],
      env_production: {
        NODE_ENV: "PROD",
        DATA_DIR: "/www/https.one-time-link.ledu.dev/data",
      },
      env_development: {
        NODE_ENV: "DEV",
        DATA_DIR: "/tmp/onedata/",
      },
    },
  ],
};
