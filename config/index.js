module.exports = {
    AUTHORIZATION_TOKEN_SECRET: process.env.AUTHORIZATION_TOKEN_SECRET || 'LOCAL_SECRET_KEY',
    RESETPASSWORD_TOKEN_SECRET: process.env.RESETPASSWORD_TOKEN_SECRET || 'EMAIL_SECRET_KEY',
    db: {
        USERNAME: process.env.USERNAME || 'root',
        PASSWORD: process.env.PASSWORD || null,
        DATABASE: process.env.DATABASE || 'api_node_demo',
        HOST: process.env.HOST || '127.0.0.1',
        dialect: 'postgres'
    }
};
