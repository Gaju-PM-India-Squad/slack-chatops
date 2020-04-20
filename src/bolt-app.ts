import { App, AuthorizeResult, AuthorizeSourceData, ExpressReceiver } from '@slack/bolt';
import config from 'config';
import moment from 'moment-timezone';
import { connect, connection } from 'mongoose';
import Sigsci from 'sigsci';

import { BluepagesClient } from './bluepages/bluepages';
import { configureExpressReceiver } from './configure-install-flow';
import { emailValidator } from './utilities/email-validator';
import { logger } from './utilities/logger';

(async (): Promise<void> => {
    let expressReceiver = new ExpressReceiver({
        signingSecret: config.get('slack.signingSecret'),
    });

    if (process.env.NODE_ENV === 'production') {
        const sigsci = new Sigsci({
            path: '/var/run/sigsci/sigsci.sock',
        });
        expressReceiver.app.use(sigsci.express());
    }

    // Used by Kube readiness and liveness probe
    expressReceiver.app.get('/ready', async function readyinessProbe(_req, res): Promise<void> {
        try {
            const mongoResponse = await connection.db.admin().ping();
            if (!mongoResponse) {
                const error = new Error('Failed to connect to mongo');
                throw error;
            }
            res.sendStatus(200);
        } catch (err) {
            logger.error('Failed kubs probe with error', err);
            res.sendStatus(500);
        }
    });

    // This is an example of how you can add a custom endpoint to your application
    // if you are integrating with other services.
    expressReceiver.app.get('/custom-endpoint', function readyinessProbe(_req, res): void {
        res.sendStatus(200);
    });

    const bluepagesClient = new BluepagesClient();
    const slackConfig: any = config.get('slack');
    await connect(config.get('mongo.mongoUrl'), config.get('mongo.mongoOptions'));

    const slickSlackOpts = {
        client_id: config.get('slack.clientId'),
        client_secret: config.get('slack.clientSecret'),
    };
    // eslint-disable-next-line global-require
    const slick = require('@slack-at-ibm-bots/slapp-mongo')(
        config.get('mongo.mongoKeys'),
        config.get('mongo.cachingDuration'),
        false,
    );

    expressReceiver = configureExpressReceiver(expressReceiver, slick, slickSlackOpts);
    const boltApp = new App({
        receiver: expressReceiver,
        authorize: async (source: AuthorizeSourceData): Promise<AuthorizeResult> => {
            const result = await slick.getTokenByTeamId(source.teamId);

            return {
                botToken: result.bot_token,
                botId: result.app_bot_id,
                botUserId: result.bot_user_id,
            };
        },
    });

    boltApp.command(config.get('bluepages.slashCommand'), async function slash({ ack, body, context }): Promise<void> {
        ack();

        const emailAddress = body.text;
        const emailValid = emailValidator(emailAddress);

        if (emailValid) {
            const bluepagesData = await bluepagesClient.getBluepagesData(emailAddress);

            if (bluepagesData) {
                let currentTime = 'N/A';
                if (bluepagesData.timeZoneCode !== 'N/A') {
                    currentTime = moment.tz(bluepagesData.timeZoneCode).format('hh:mm A');
                }

                await boltApp.client.chat.postMessage({
                    token: context.botToken,
                    channel: body.user_id,
                    text: '',
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*${bluepagesData.fullName}*`,
                            },
                            fields: [
                                {
                                    type: 'mrkdwn',
                                    text: `*Job Title*: ${bluepagesData.role}\n *Department*: ${bluepagesData.orgTitle}\n *Location*: ${bluepagesData.location}\n *Local Time*: ${currentTime}\n *Employee Type*: ${bluepagesData.employeeType}`,
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*Email*: ${bluepagesData.preferredIdentity}\n *Office Number*: ${bluepagesData.telephoneOffice}\n *Mobile Number*: ${bluepagesData.telephoneMobile}\n *Notes ID*: ${bluepagesData.notesEmail}\n *Serial Number*: ${bluepagesData.uid}\n *Legal Entity*: ${bluepagesData.legalEntity}`,
                                },
                            ],
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    url: `slack://user?team=${body.team_id}&id=${bluepagesData.slackId}`,
                                    text: {
                                        type: 'plain_text',
                                        text: `Direct Message ${bluepagesData.fullName}`,
                                        emoji: true,
                                    },
                                },
                            ],
                        },
                    ],
                });
            } else {
                await boltApp.client.chat.postMessage({
                    token: context.botToken,
                    channel: body.user_id,
                    text: 'Email address not found in Bluepages. Please try again example: username@ibm.com',
                });
            }
        } else {
            await boltApp.client.chat.postMessage({
                token: context.botToken,
                channel: body.user_id,
                text: 'Invalid email address, please try again.',
            });
        }
    });

    boltApp.error((error: Error): void => {
        logger.error('Uncaught error', error);
    });

    await boltApp.start(config.get('port'));

    logger.log(`Bluepages bot is running on port:${config.get('port')}`);
})().catch(console.error);
