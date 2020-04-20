import url from 'url';

const defer = require('config/defer').deferConfig;

export default {
    orgs: ['E27SFGS2W', 'EJ9GJ7P89'],
    port: process.env.PORT || 8081,
    slack: {
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        scope: ['bot', 'commands'],
    },
    bluepages: {
        slashCommand: '/bluepages',
    },
    mongo: {
        mongoOptions: {
            socketTimeoutMS: 30000,
            keepAlive: true,
            reconnectTries: 30000,
        },
        mongoUrl: process.env.MONGO_DB_URL,
        mongoKeys: {
            encryptionKey: process.env.MONGO_DB_ENCRYPTION_KEY,
            signingKey: process.env.MONGO_DB_SIGNING_KEY,
        },
        cachingDuration: 60, // seconds
    },
    newrelic: {
        agent_enabled: true,
        appName: 'Bluepages Bot',
        licenseKey: process.env.NEWRELIC_LICENCE_KEY,
        customEventPrefix: 'BluepagesBot',
    },
    installUri: defer((config: any): string =>
        url.format({
            protocol: 'https',
            host: 'slack.com',
            pathname: '/oauth/authorize',
            query: {
                scope: config.slack.scope.join(','),
                client_id: config.slack.clientId,
            },
        }),
    ),
};
