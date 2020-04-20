/* eslint-disable no-console */
import config from 'config';
import newrelic from 'newrelic';

export const logger = {
    debug: (...args: any): void => {
        console.debug(...args);
    },
    info: (...args: any): void => {
        console.info(...args);
    },
    log: (...args: any): void => {
        console.log(...args);
    },
    warn: (...args: any): void => {
        console.warn(...args);
    },
    error: (contextMessage: string, error: Error, customAttributes?: { [key: string]: string } | undefined): void => {
        console.error(contextMessage, error, customAttributes);
        newrelic.noticeError(error, customAttributes);
    },
    recordEvent: (name: string, attributes: { [keys: string]: string | number | boolean }): void => {
        console.log(`${config.get('newrelic.customEventPrefix')}:${name}`, attributes);
        newrelic.recordCustomEvent(`${config.get('newrelic.customEventPrefix')}:${name}`, attributes);
    },
    incrementCounter: (name: string, incrementCount: number | undefined): void => {
        newrelic.incrementMetric(`${config.get('newrelic.customEventPrefix')}:${name}`, incrementCount);
    },
};
