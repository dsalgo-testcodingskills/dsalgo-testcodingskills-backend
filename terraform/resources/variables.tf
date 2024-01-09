variable "project_id" {
  description = "Google Cloud projectId"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
}

variable "service_account_email" {
  description = "Service Account to use while creating resources"
  type        = string
}