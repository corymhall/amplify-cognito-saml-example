import { AwsCdkTypeScriptApp } from 'projen';
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: 'amplify-cognito-saml',
  projenrcTs: true,

  cdkDependencies: [
    '@aws-cdk/aws-cognito',
    '@aws-cdk/aws-iam',
  ],

  buildWorkflow: false,
  releaseWorkflow: false,
  stale: false,
  github: false,

  // cdkDependencies: undefined,        /* Which AWS CDK modules (those that start with "@aws-cdk/") this app uses. */
  // deps: [],                          /* Runtime dependencies of this module. */
  // description: undefined,            /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],                       /* Build dependencies for this module. */
  // packageName: undefined,            /* The "name" in package.json. */
  // projectType: ProjectType.UNKNOWN,  /* Which type of project this is (library/app). */
  // release: undefined,                /* Add release management to this project. */
});

project.gitignore.include('cdk.out');
project.synth();
