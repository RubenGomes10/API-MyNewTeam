module.exports = {
  env: process.env.NODE_ENV || "dev",
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 8080,
  DBHost: process.env.MONGO_DB_URI || "mongodb://localhost/SportsClubProject",
  tokenSecret: process.env.TOKEN_SECRET || "super_Sports_keyRHM",
  adminUsername: process.env.ADMIN_USERNAME || "globalAdmin",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin123&123",
  adminEmail: process.env.ADMIN_EMAIL || "Admin@admin.com"
}
