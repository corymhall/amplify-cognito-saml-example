<template>
  <Login/>

</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import AWS from 'aws-sdk'
import { Auth, Hub } from 'aws-amplify'

@Component({})
export default class Hello extends Vue {


  async handleAuthEvent (data: any) {
    switch (data.payload.event) {
      case 'signIn':
        console.log('signedIn')
        console.log(data)
        this.getUser().then(userData => console.log(userData))
        break
      case 'signOut':
        break
    }
  }

  async fetch () {
    // returns object with accessToken, idToken, and refreshToken
    const token = await Auth.currentSession()
    console.log('currentSesion', token);

    const jwtToken = (await Auth.currentSession()).getIdToken().getJwtToken()
    console.log('jwtToken', jwtToken);

    // returns user object with attributes, username, etc.
    const user = await Auth.currentUserPoolUser()
    console.log('user', user)

    // similar to currentUserPoolUser
    const userInfo = await Auth.currentUserInfo()
    console.log('userInfo', userInfo)

    // get AWS credentials using CognitoIdentityCredentials
    AWS.config.region = 'us-east-1';
    const currentCreds = this.createCredentials(jwtToken)
    currentCreds.get((err) => {
      if (err) {
        console.error('AWSCredentialsService: Cognito get error:', err)
      }
    })
    AWS.config.credentials = currentCreds

    // use a service client (in this case dynamodb) to get data
    var dynamodb = new AWS.DynamoDB({region: 'us-east-1'})
    dynamodb.listTables({Limit: 10}, function(err, data) {
      if (err) console.log(err, err.stack)
      else console.log(data)
    })

  }

  createCredentials(token: string): AWS.CognitoIdentityCredentials {
    const options: AWS.CognitoIdentityCredentials.CognitoIdentityOptions = {
      IdentityPoolId: 'us-east-1:1f111111-a3b9-4b48-4444-7777777c2cc2',
      Logins: {
        'cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX': token,
      }
    }

    return new AWS.CognitoIdentityCredentials(options)
  }


  getUser () {
    return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(() => console.log('not signed in'))
  }

  beforeCreate () {
    Hub.listen('auth', (data) => {
      this.handleAuthEvent(data)
    })
  }
}
</script>
