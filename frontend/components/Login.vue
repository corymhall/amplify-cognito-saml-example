<template>
  <div>
    <button v-on:click="login">Login</button>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { Auth } from 'aws-amplify'

@Component({})
export default class Login extends Vue {

  async login () {
    try {
      // trigger federated sign in through SAML provider
      const user = await Auth.federatedSignIn()
    } catch (error) {
      console.error('error signing in', error)
    }
  }
}
</script>
