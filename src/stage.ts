import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

export class AppStage extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);
    const stack = new cdk.Stack(this, 'AuthStack');

    const pool = new cognito.UserPool(stack, 'UserPool', {
      customAttributes: {
        groups: new cognito.StringAttribute(),
        adgroups: new cognito.StringAttribute({ mutable: true }),
      },
    });
    pool.addDomain('domain', {
      cognitoDomain: {
        domainPrefix: 'example',
      },
    });


    new cognito.CfnUserPoolIdentityProvider(stack, 'SamlProvider', {
      userPoolId: pool.userPoolId,
      providerName: 'CognitoSSO',
      providerType: 'SAML',
      attributeMapping: {
        'email': 'Email',
        'name': 'Name',
        'custom:adgroups': 'Groups',

      },
      providerDetails: {
        // this would be the URL to retreive your providers (i.e. Azure AD) metadata file
        MetadataURL: 'https://portal.sso.us-east-1.amazonaws.com/saml/metadata/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      },
    });

    const client = pool.addClient('client', {
      oAuth: {
        // use your own callbackURL
        callbackUrls: [
          'https://example.com',
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.custom('CognitoSSO'),
      ],
    });


    const identityPool = new cognito.CfnIdentityPool(stack, 'IdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        providerName: `cognito-idp.${stack.region}.amazonaws.com/${pool.userPoolId}`,
        clientId: client.userPoolClientId,
      }],
    });

    const authRole = new iam.Role(stack, 'AuthRole', {
      assumedBy: new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com').withConditions({
        'StringEquals': { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
      }),
    });

    authRole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['dynamodb:ListTables'],
      resources: ['*'],
    }));

    new cognito.CfnIdentityPoolRoleAttachment(stack, 'RoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authRole.roleArn,
      },
      roleMappings: {
        cognitoUserPool: {
          type: 'Rules',
          identityProvider: `cognito-idp.${stack.region}.amazonaws.com/${pool.userPoolId}:${client.userPoolClientId}`,
          ambiguousRoleResolution: 'Deny',
          rulesConfiguration: {
            rules: [{
              claim: 'custom:adgroups',
              value: '3de2d8a6-282a-4114-9dc0-10abe8453ad3', // value of the adgroup
              roleArn: authRole.roleArn,
              matchType: 'Contains',
            }]
          }
        },
      },
    });
  }
}
