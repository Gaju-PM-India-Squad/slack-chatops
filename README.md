[![Build Status](https://travis.ibm.com/slack-at-ibm-bots/bot-template.svg?token=qt1R1xbmiS7dUrbudL68&branch=master)](https://travis.ibm.com/slack-at-ibm-bots/bot-template)

# bot-template

This is a basic Slack application using the [Bolt library](https://slack.dev/bolt/tutorial/getting-started), written in Node and Typescript. This project sets up basic scaffolding and testing as a template for future applications.

This sample application allows you to run the app in two modes:

-   Running with bot token: A single bot token so you can run this app in a single development workspace
-   Running with Oauth flow: Oauth flow that will encrypt and save the tokens to a mongoDB

Node 10.16.0 or greater is required to run this application. If you have [nvm](https://github.com/creationix/nvm) installed typing in `nvm use` will set appropriate runtime environment.

## Setup

1. [Use httpshare](https://github.ibm.com/Whitewater/httpshare) to expose your localhost to Slack
1. Create a [new Slack app](https://api.slack.com/slack-apps)
1. Configure a new slash command by going to "Slash Commands" -> "Create New Command".
1. Input `/foobar` as the command and `<your httpshare tunnel address>/slack/events` and the Request URL
    - **Whenever you have to restart httpshare, you must update the request url for your slash command**
1. Add a bot user to your app by going to "Bot Users" -> "Add a Bot User"

We will also be configuring event subscriptions for your bot. This is a tricky step, however, because you need your app to be running first to respond with 200 when Slack validates the event subscription url. Because of this requirement, we will configure event subscriptions at a later step and first get slash commands working.

## Running with bot token

Running your app with this method will not enable your app to be installable on multiple workspaces. The main use case for running in this mode is to ease local development of a new Slack application.

Follow the below steps to run the bot template **without** an install flow.

1. Copy the below code into a file called `local.ts` under the `config` directory

```nodeJs
export default {
    slack: {
        signingSecret: 'INSERT SIGNING SECRET',
        botToken: 'INSERT BOT TOKEN',
    },
};
```

1. Install your Slack app to your development workspace (i.e. the workspace you selected when creating your Slack app) by going to your Slack app -> "Oauth & Permissions" -> click `Install App to Workspace`.
1. Copy the `Bot User Oauth Access Token` generated in the prior step and paste it in your `local.ts` config as `botToken`.
1. Navigate to the `Basic Information` tab and copy the `Signing Secret` and paste it in your `local.ts` config as `signingSecret`.
1. Run `npm install` to update dependencies
1. Run `./bin/start-db.sh` to start your local mongo db
1. Run `npm start` to start the server
1. Check that httpshare is running. If you need to restart httpshare, be sure to update the request url for the `/foobar` slash command.

At this point, if you go to [https://localhost:8080/custom-endpoint](https://localhost:8080/custom-endpoint) in your browser, you should see an `OK` page.

If you try typing `/foobar` in your Slack client, your app should respond with `foobar! this is an example skill`.

## Running with Oauth flow

If you want your app installable on other workspaces, you will need to implement Slack's Oauth flow as described here: https://api.slack.com/docs/oauth

Lucky for you, we have already implemented the Oauth flow in our [https://github.ibm.com/slack-at-ibm-bots/slapp-mongo](slapp-mongo) repository and imported it into this bot template. This enables the bot template to encrypt and store tokens into a MongoDB. If your team does not want to use MongoDB as your database, we recommend reading through the Slack Oauth documentation linked above.

Follow the below steps to run the bot template with an install flow.

1. Copy the below code into a file called `local.ts` under the `config` directory

```nodeJs
export default {
    slack: {
        clientId: 'INSERT CLIENT ID',
        clientSecret: 'INSERT CLIENT SECRET',
        signingSecret: 'INSERT SIGNING SECRET',
    },
    mongo: {
        mongoOptions: {
            socketTimeoutMS: 30000,
            keepAlive: true,
            reconnectTries: 30000,
        },
        mongoUrl: 'mongodb://localhost/bottemplate',
        mongoKeys: {
            encryptionKey: 'INSERT ENCRYPTION KEY',
            signingKey: 'INSERT SIGNING KEY',
        },
        cachingDuration: 60,
    },
};
```

1. Navigate to the `Basic Information` tab, copy the `Client Id` and paste it in your `local.ts` config as `clientId`.
1. Under the same `Basic Information` tab, copy the `Client Secret` and paste it in your `local.ts` config as `clientSecret`.
1. Navigate to the `Basic Information` tab, copy the `Signing Secret` and paste it in your `local.ts` config as `signingSecret`.
1. In a bash window, type `openssl rand -base64 32` and copy the output into your `local.ts` config as `encryptionKey`.
1. In a bash window, type `openssl rand -base64 64` and copy the output into your `local.ts` config as `signingKey`.
1. Run `npm install` to update dependencies
1. Run `./bin/start-db.sh` to start your local mongo db
1. Run `npm start` to start the server
1. Navigate to the `Oauth & Permissions` tab. Under `Redirect URLs` section, click `Add New Redirect URL`. Past your httpshare url with `/oauth` at the end (i.e. `<your httpshare tunnel address>/oauth`). Click `Add` then click `Save URLs`.
1. Navigate to the `Manage Distribution` tab. Click on the `Remove Hard Coded Information` accordion. Check the `I've reviewed and removed any hard-coded information` checkbox, then click `Activate Public Distribution`. This will **not** publish your app to the Slack directory. It only enables your app to be installable on multiple workspaces.

At this point, your app should be ready to go through an install flow. Go to the `Manage Distribution` tab and click the `Add to Slack` button and then click `Allow`. If you are redirected to an `OK` page, then the install was successful! To verify that you have a working token, setup event subscriptions documented in the next section or [view your local MongoDB in Robo 3T](#robo-3t).

## Enable event subscriptions

Event subscriptions are an easy way for your bot to know what is going on in your Slack workspace. This will include @-mentions and direct messages to the bot. For a more in depth overview of Slack's Events API, you can read their documentation here: [https://api.slack.com/events-api](https://api.slack.com/events-api).

**For this template, we will setup our app to listen for direct messages to our bot. The below steps assume you have httpshare running and your bot template running by following either of the above documented methods.**

1. Navigate to the `Event Subscriptions` tab and toggle the events on
1. Copy your httpshare url into the `Request Url` field and add `/slack/events` (i.e. `httpsharetunnel/slack/events`).
    - Slack will verify that your app can accept events by sending an HTTP POST request to your app. If your URL is valid and your app is running, you should see Slack mark your `Request URL` as `Verified`. If Slack does not, double check your httpshare url and that your app is running.
1. Expand the accordion for `Subscribe to bot events` and click `Add Bot User Event`. Add the `message.im` event. This will tell Slack to send your app an event whenever a user directly messages your bot user.
1. Click the `Save Changes` button at the bottom of the `Event Subscriptions` page.
1. Reinstall your Slack app to your workspace.
    - If you are running your app via the bot token method, you can click the `Reinstall App` under the `Oauth & Permissions` tab
    - If you are running your app via the Oauth flow enabled method, you can click the `Add to Slack` button under the `Manage Distribution` tab and follow the install flow.

After following the above steps, your app should now be enabled to listen to messages posted directly to your bot user. If you type `Hi` in your bot's direct messages, the bot should respond with `Hello, <your user name>.`. If you type `Bye` or any other phrase that does not contain `Hi`, the bot will not respond. You can play with how your bot should respond to users by tweaking the [code that declares how your bot should respond to direct messages](https://github.ibm.com/slack-at-ibm-bots/bot-template/blob/master/src/bolt-app.ts#L69).

## Debugging your setup

## Robo 3T

## Visual Studio Code

If you're using [VS Code](https://code.visualstudio.com/), we recommend using the following plugin: [EsLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and adding the following settings to your vscode settings under `.vscode/settings.json`.

```json
{
    "eslint.autoFixOnSave": true,
    "eslint.validate": [
        "javascript",
        {
            "language": "typescript",
            "autoFix": true
        }
    ],
    "editor.formatOnSave": true,
    "[javascript]": {
        "editor.formatOnSave": false
    },
    "[javascriptreact]": {
        "editor.formatOnSave": false
    },
    "[typescript]": {
        "editor.formatOnSave": false
    },
    "[typescriptreact]": {
        "editor.formatOnSave": false
    }
}
```

## Fitness Metrics

-   {@FM: NewRelic }: N/A
-   {@FM: Kubernetes Cluster }: N/A
-   {@FM: Renovate }: false
-   {@FM: Alerting }: N/A
-   {@FM: PagerDuty Service }: N/A
-   {@FM: Onboarded to Incident Manager }: N/A
-   {@FM: Tests > 80% }: false
-   {@FM: Linting }: true
-   {@FM: SignalSciences }: N/A
-   {@FM: npm audit }: false
-   {@FM: Integration Tests }: N/A
-   {@FM: LogDNA }: N/A
-   {@FM: CI }: true
-   {@FM: CD }: false
-   {@FM: ReadMe }: true
