module.exports = {
  apps: [
    {
      name: "wow-radio",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
