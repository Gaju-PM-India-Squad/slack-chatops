export default {
    port: process.env.PORT || 8081,
    mongo: {
        mongoOptions: {
            user: process.env.DB_USER,
            pass: process.env.DB_PASS,
            mongos: {
                ssl: true,
                sslValidate: false,
                sslCA: process.env.MONGO_CERT,
            },
        },
        mongoUrl: process.env.MONGO_DB_URL,
        mongoKeys: {
            encryptionKey: process.env.MONGO_DB_ENCRYPTION_KEY,
            signingKey: process.env.MONGO_DB_SIGNING_KEY,
        },
        cachingDuration: 60, // seconds
    },
};
