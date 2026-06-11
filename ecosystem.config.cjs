module.exports = {
  apps: [
    {
      name: "parkandfly",
      script: ".output/server/index.mjs",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      // Node ulazi u produkcijski način — Supabase ključeve čita iz .env (učitano preko PM2 niže)
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "127.0.0.1",
      },
      max_memory_restart: "512M",
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      time: true,
    },
  ],
};
