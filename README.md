# terraform-genai-retrieval-augmented-generation

## StudioOS Pipeline Automation

This repository includes automated pipeline execution via GitHub Actions to streamline development workflows.

### Automatic Execution

The StudioOS pipeline runs automatically when:
- A new pull request is opened against the `main` branch
- Updates are pushed to an active pull request
- Manually triggered via workflow dispatch

### Manual Execution

You can run the pipeline manually in two ways:

#### 1. Via GitHub Actions UI

1. Navigate to **Actions** → **StudioOS Pipeline**
2. Click **Run workflow**
3. Optionally specify a custom PR number (default: `347` for historical testing)
4. Click **Run workflow**

#### 2. Via Command Line

```bash
# Run with default PR number
./studioos_pipeline.sh

# Run with a specific PR number
./studioos_pipeline.sh --pr-number 123

# Run with verbose output
./studioos_pipeline.sh --verbose
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STUDIOOS_PR_NUMBER` | PR number to process | `347` |

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Pipeline script not found | Ensure `studioos_pipeline.sh` exists in the repository root |
| Permission denied | Run `chmod +x studioos_pipeline.sh` to make the script executable |
| Missing dependencies | Ensure `git` and `bash` are installed |
| Pipeline fails in CI | Check the GitHub Actions logs for detailed error messages |

### Pipeline Results

Pipeline results are available in:
- **GitHub Actions Checks tab**: View the workflow run status and logs
- **Job Summary**: Detailed summary with PR number, event type, and status

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| database\_type | Cloud SQL MySQL, Cloud SQL PostgreSQL, AlloyDB, or Cloud Spanner | `string` | `"postgresql"` | no |
| deletion\_protection | Whether or not to protect Cloud SQL resources from deletion when solution is modified or changed. | `string` | `false` | no |
| enable\_apis | Whether or not to enable underlying apis in this solution. . | `string` | `true` | no |
| frontend\_container | The public Artifact Registry URI for the frontend container | `string` | `"us-docker.pkg.dev/google-samples/containers/jss/rag-frontend-service:v0.0.2"` | no |
| labels | A map of labels to apply to contained resources. | `map(string)` | <pre>{<br>  "genai-rag": true<br>}</pre> | no |
| project\_id | Google Cloud Project ID | `string` | n/a | yes |
| region | Google Cloud Region | `string` | `"us-central1"` | no |
| retrieval\_container | The public Artifact Registry URI for the retrieval container | `string` | `"us-docker.pkg.dev/google-samples/containers/jss/rag-retrieval-service:v0.0.3"` | no |

## Outputs

| Name | Description |
|------|-------------|
| deployment\_ip\_address | Web URL link |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
