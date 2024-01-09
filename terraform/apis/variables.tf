variable "project_id" {
  description = "Google Cloud projectId"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
}

variable "gcp_service_list" {
  description = "List of GCP service to be enabled for a project."
  type        = list(any)
  default = [
    "cloudresourcemanager.googleapis.com", # Compute Engine
    "cloudapis.googleapis.com",            # Google Cloud APIs(Cloud Run)
    "compute.googleapis.com",              # Compute Engine API
    "logging.googleapis.com",              # Stackdriver Logging API
    # "sql-component.googleapis.com",        # Cloud SQL
    # "redis.googleapis.com",                # Redis
    "run.googleapis.com", # Cloud Run
    # "vpcaccess.googleapis.com",            # Serverless VPC Access API
    # "servicenetworking.googleapis.com",    # Provides automatic management of network configurations
    # "bigqueryconnection.googleapis.com",   # Big query
    # "sqladmin.googleapis.com"              # SQL Admin API for SQL instance
  ]
}
