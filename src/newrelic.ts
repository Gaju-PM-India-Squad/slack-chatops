import Config from 'config';

export const config = {
    app_name: [Config.get('newrelic.appName')],
    agent_enabled: Config.get('newrelic.agent_enabled'),
    license_key: Config.get('newrelic.licenseKey'),
    logging: {
        level: 'info',
    },
};
