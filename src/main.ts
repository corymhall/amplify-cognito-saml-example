import * as cdk from '@aws-cdk/core';
import { AppStage } from './stage';

const app = new cdk.App();

new AppStage(app, 'CognitoApp', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});


app.synth();
