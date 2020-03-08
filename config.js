module.exports = {
  db: {
    url: 'mongodb://localhost',
    ssl: {}
  },
  https: parseInt(process.env.WCCSP_HTTPS),
  certs: {
    key: './certs/jddamore.key',
    ca: './certs/jddamore_com.ca-bundle',
    cert: './certs/jddamore_com.crt',
  },
  debug: parseInt(process.env.WCCSP_DEBUG), 
  port: parseInt(process.env.WCCSP_PORT) ? parseInt(process.env.WCCSP_PORT) : 80 
};