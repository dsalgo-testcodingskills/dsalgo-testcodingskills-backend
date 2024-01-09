variable "project_id" {
  description = "Google Cloud projectId"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_access_key" {
  description = "AWS Access Key"
  type        = string
}

variable "aws_secret_key" {
  description = "AWS Secret Key"
  type        = string
}

variable "service_account_email" {
  description = "Service Account to use while creating resources"
  type        = string
}