module.exports = {
  apps: [
    {
      name: "ssi-info-hub",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: "/root/ssi-info-hub/info-hub",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};