provider "aws" {
  region = "us-east-2"
}

resource "aws_cognito_user_pool" "pool" {
  name = "amplifyPool"
  schema {
    attribute_data_type = "String"
    name = "adgroups"
    mutable = true
  }
}

resource "aws_cognito_user_pool_domain" "domain" {
  domain = "example"
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "aws_cognito_user_pool_client" "client" {
  name = "webClient"
  user_pool_id = aws_cognito_user_pool.pool.id
  allowed_oauth_flows = ["implicit", "code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes = ["profile", "phone", "email", "openid", "aws.cognito.signin.user.admin"]
  callback_urls = ["https://example.com"]
  supported_identity_providers = ["CognitoSSO"]
}

resource "aws_cognito_identity_provider" "saml" {
  user_pool_id = aws_cognito_user_pool.pool.id
  provider_name = "CognitoSSO"
  provider_type = "SAML"
  attribute_mapping = {
    email = "Email"
    name = "name"
    "custom:adgroups" = "Groups"
  }
  provider_details = {
    metadata_url = ""
  }
}

resource "aws_cognito_identity_pool" "identity_pool" {
  identity_pool_name = "identityPool"
  allow_unauthenticated_identities = false
  cognito_identity_providers {
    client_id = aws_cognito_user_pool_client.client.id
    provider_name = "cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.pool.id}"
  }
}

resource "aws_iam_role" "authenticated" {
  name = "cognito_authenticated"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "${aws_cognito_identity_pool.identity_pool.id}"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
EOF
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.identity_pool.id

  role_mapping {
    identity_provider         = "cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.pool.id}"
    ambiguous_role_resolution = "Deny"
    type                      = "Rules"

    mapping_rule {
      claim      = "custom:adgroups"
      match_type = "Contains"
      role_arn   = aws_iam_role.authenticated.arn
      value      = "3de2d8a6-282a-4114-9dc0-10abe8453ad3"
    }
  }

  roles = {
    "authenticated" = aws_iam_role.authenticated.arn
  }
}
