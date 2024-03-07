module.exports = {
  apps: [
    {
      name: "BorsaHero Server",
      script: "ts-node src/index.ts",
      watch: false,
      merge_logs: true,
      cwd: "/home/ubuntu/Backend",
    },
  ],
};
