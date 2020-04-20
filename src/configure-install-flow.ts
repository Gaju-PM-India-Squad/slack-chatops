import { ExpressReceiver } from '@slack/bolt';
import config from 'config';

import { logger } from './utilities/logger';

export function configureExpressReceiver(
    expressReceiver: ExpressReceiver,
    slick: any,
    slickSlackOpts: any,
): ExpressReceiver {
    expressReceiver.app.get('/install', (_req: any, res: { redirect: (arg0: any) => void }): void => {
        res.redirect(config.get('installUri'));
    });

    expressReceiver.app.get(
        '/oauth',
        slick.oauth(slickSlackOpts, config.get('orgs')),
        (
            req: {
                teamId: any;
                userId: any;
            },
            res: any,
        ): void => {
            const { teamId, userId } = req;
            logger.log(`Successfully installed on ${teamId} by ${userId}`);
            res.sendStatus(200);
        },
    );

    expressReceiver.app.use(
        '/oauth',
        (
            err: any,
            _req: any,
            res: {
                statusCode: number;
                send: {
                    (arg0: any): void;
                    (arg0: any): void;
                };
            },
            next: () => void,
        ): void => {
            logger.error('Failed to install with error: ', err);
            if (res.statusCode === 403) {
                res.send('forbidden');
            } else {
                res.send('install error');
            }
            next();
        },
    );

    return expressReceiver;
}
