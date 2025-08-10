# GitHub Actions Workflows

## Active Workflows

### 1. `process-staticman-admin.yml`
- **Trigger:** Pull requests opened with branch name starting with `staticman_`
- **Purpose:** Process admin panel submissions from Staticman
- **Authentication:** Uses `PAT_TIMELINE_BOT` secret
- **Actions:** Updates timeline-data.js with new/edited entries

### 2. `apply-timeline-update.yml`
- **Trigger:** Manual workflow dispatch
- **Purpose:** Manually process a PR when automatic processing fails
- **Authentication:** Uses `PAT_TIMELINE_BOT` secret
- **Input:** PR number

### 3. `process-submissions.yml`
- **Trigger:** Issues closed as completed with `timeline-submission` label
- **Purpose:** Process timeline submissions via GitHub issues
- **Authentication:** Uses default `GITHUB_TOKEN`

## Disabled Workflows

The following workflows have been disabled to prevent conflicts:

### `process-staticman-simple.yml.disabled`
- Conflicted with `process-staticman-admin.yml`
- Used GITHUB_TOKEN instead of PAT (couldn't push to PR branches)

### `process-admin-pr.yml.disabled`
- Conflicted with `process-staticman-admin.yml`
- Had overlapping triggers
- Used GITHUB_TOKEN instead of PAT

## Setup Requirements

1. **PAT_TIMELINE_BOT Secret**
   - Required for workflows that push to PR branches
   - Must have `repo` scope
   - Set in: Settings → Secrets and variables → Actions

2. **Permissions**
   - Workflows need read/write permissions
   - Set in: Settings → Actions → General → Workflow permissions

## Workflow Decision Tree

```
PR Opened
├─ Branch starts with "staticman_"?
│  └─ YES → process-staticman-admin.yml
│
Issue Closed
├─ Has "timeline-submission" label?
│  └─ YES → process-submissions.yml
│
Manual Trigger
└─ apply-timeline-update.yml (with PR number)
```

## Troubleshooting

If a workflow fails:
1. Check Actions tab for error details
2. Verify PAT_TIMELINE_BOT secret exists
3. Use `apply-timeline-update.yml` manual workflow as fallback
4. Check workflow logs for authentication errors