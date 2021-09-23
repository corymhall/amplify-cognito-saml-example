// https://github.com/aws-amplify/amplify-js/issues/6411
import Amplify, { Auth } from 'aws-amplify'

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: '', // populate with user pool id
    userPoolWebClientId: '', // populate with userPoolWebClientId
    oauth: {
      domain: 'example.auth.us-east-1.amazoncognito.com', // populate with cognito domain
      scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      redirectSignIn: 'https://example.com',
      redirectSignOut: 'https://example.com',
      responseType: 'code'
    }
  }
})

