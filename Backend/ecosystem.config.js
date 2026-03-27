// PM2 cluster mode configuration
// Spawns one worker per vCPU; ECS task should set CPU allocation accordingly.
// Use: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: 'eduscale-api',
      script: 'dist/main.js',

      // Cluster mode — one process per logical CPU core.
      // On a 2-vCPU ECS task this doubles throughput before needing a second task.
      instances: 'max',
      exec_mode: 'cluster',

      // Node flags: load tsconfig-paths aliases and dotenv before anything else
      node_args: '-r module-alias/register -r dotenv/config',

      // Restart on any uncaught exception (process.exit(1) already set in main.ts)
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,

      // Memory threshold — restart a worker if it exceeds 512 MB
      // (guards against memory leaks between deploys)
      max_memory_restart: '512M',

      // Environment — read from process.env injected by ECS task definition
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Structured logging: write JSON stdout/stderr to CloudWatch-friendly files
      // In ECS, use `awslogs` log driver instead — set out_file/error_file to /dev/null
      out_file: '/dev/null',
      error_file: '/dev/null',
      merge_logs: true,
      log_type: 'json',

      // Graceful shutdown — give in-flight requests 10s to complete
      kill_timeout: 10000,
      listen_timeout: 10000,
    },
  ],
};
