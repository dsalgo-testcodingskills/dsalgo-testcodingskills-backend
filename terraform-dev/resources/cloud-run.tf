resource "google_cloud_run_service" "default" {
  # This will be used in Github actions
  name                       = "coding-assessment-dev-api"
  location                   = var.region
  autogenerate_revision_name = true

  template {
    spec {
      service_account_name = var.service_account_email
      containers {
        # this a dummy image, which will be changes from CI/CD (github action maybe)
        image = "gcr.io/cloudrun/hello"

        resources {
          limits = {
            cpu    = "2.0"
            memory = "2048Mi"
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "5"
      }
    }
  }

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "all"
    }
  }

  # We ignore the below image changes as they are being updated by github actions
  lifecycle {
    ignore_changes = [
      template.0.spec.0.containers.0.image,
      template.0.metadata.0.annotations["client.knative.dev/user-image"],
      template.0.metadata.0.annotations["run.googleapis.com/client-version"],
      metadata.0.annotations["client.knative.dev/user-image"],
      metadata.0.annotations["run.googleapis.com/client-name"],
      metadata.0.annotations["run.googleapis.com/client-version"],
    ]
  }
}

resource "google_cloud_run_service_iam_member" "public-access" {
  location = google_cloud_run_service.default.location
  project  = google_cloud_run_service.default.project
  service  = google_cloud_run_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
