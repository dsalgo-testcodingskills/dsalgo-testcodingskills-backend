module "aws_cognito_user_pool_complete" {

  source = "lgallard/cognito-user-pool/aws"

  user_pool_name      = "coding-assessment-dev-pool"
  username_attributes = ["email"]

  clients = [
    {
      allowed_oauth_flows                  = []
      allowed_oauth_flows_user_pool_client = false
      allowed_oauth_scopes                 = []
      explicit_auth_flows                  = []
      generate_secret                      = false
      logout_urls                          = []
      name                                 = "coding-assessment-dev-client"
      read_attributes                      = ["email"]
      supported_identity_providers         = []
      write_attributes                     = []
      access_token_validity                = 24
      id_token_validity                    = 24
      refresh_token_validity               = 30
      token_validity_units = {
        access_token  = "hours"
        id_token      = "hours"
        refresh_token = "days"
      }
    }
  ]

  password_policy = {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 10
  }

  string_schemas = [
    {
      attribute_data_type          = "String"
      developer_only_attribute     = false
      mutable                      = false
      name                         = "email"
      required                     = true
      string_attribute_constraints = {}
    },
    {
      attribute_data_type          = "String"
      developer_only_attribute     = false
      mutable                      = true
      name                         = "name"
      required                     = true
      string_attribute_constraints = {}
    },
    {
      attribute_data_type          = "String"
      developer_only_attribute     = false
      mutable                      = true
      name                         = "nickname"
      required                     = true
      string_attribute_constraints = {}
    }
  ]

  recovery_mechanisms = [
    {
      name     = "verified_email"
      priority = 1
    }
  ]
}