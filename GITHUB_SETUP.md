# GitHub Repository Setup for PR Automation

## Required Setup for Admin Panel PR Processing

The GitHub Actions workflows require a Personal Access Token (PAT) to be configured as a repository secret.

### Step 1: Create a Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name like "Timeline Bot PAT"
4. Set expiration (recommend 90 days minimum)
5. Select the following scopes:
   - `repo` (Full control of private repositories) - required for pushing to PR branches
   - `workflow` (Update GitHub Action workflows) - if you need to modify workflows
6. Click "Generate token"
7. **IMPORTANT**: Copy the token immediately (it won't be shown again)

### Step 2: Add the PAT as a Repository Secret

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `PAT_TIMELINE_BOT`
5. Value: Paste the PAT you copied in Step 1
6. Click "Add secret"

### Step 3: Verify Workflow Permissions

1. Go to Settings → Actions → General
2. Under "Workflow permissions", ensure one of these is selected:
   - "Read and write permissions" (recommended)
   - OR "Read repository contents and packages permissions" with "Allow GitHub Actions to create and approve pull requests" checked

### Step 4: Enable GitHub Actions

1. Go to Settings → Actions → General
2. Under "Actions permissions", select:
   - "Allow all actions and reusable workflows"
   - OR "Allow enterprise, and select non-enterprise, actions and reusable workflows"

## How the Workflows Work

### 1. Automatic PR Processing (`process-staticman-admin.yml`)
- Triggers automatically when a PR is opened with branch name starting with `staticman_`
- Checks if the PR contains admin panel updates
- If found, processes the JSON and updates `timeline-data.js`
- Commits changes back to the PR branch
- Comments on the PR when complete

### 2. Manual PR Processing (`apply-timeline-update.yml`)
- Can be triggered manually from Actions tab
- Useful when automatic processing fails
- Requires PR number as input
- Performs same update process as automatic workflow

## Troubleshooting

### Common Issues:

1. **"Permission to danieledge/Fogh-timeline.git denied to github-actions[bot]" error**
   - The PAT secret is missing → Create `PAT_TIMELINE_BOT` secret
   - The PAT secret name is wrong → Must be exactly `PAT_TIMELINE_BOT` (case-sensitive)
   - To verify the secret exists: Go to Settings → Secrets and variables → Actions
   - The secret should appear in the list (you can't see its value)

2. **"Bad credentials" error**
   - The PAT has expired → Generate a new token
   - The PAT secret name doesn't match → Ensure it's named `PAT_TIMELINE_BOT`
   - The PAT lacks permissions → Ensure `repo` scope is selected

3. **"Resource not accessible by integration"**
   - Workflow permissions are too restrictive → Check Step 3 above
   - The default GITHUB_TOKEN lacks permissions → Use the PAT instead

4. **Workflow doesn't trigger**
   - GitHub Actions might be disabled → Check Step 4 above
   - Branch name doesn't match pattern → Ensure PR branch starts with `staticman_`

5. **Cannot push to PR branch**
   - PAT lacks repo permissions → Regenerate with `repo` scope
   - Protected branch rules → Ensure the bot can bypass protections

## Testing the Setup

1. Create a test PR with a branch name like `staticman_test_123`
2. Add a JSON file with admin update data
3. The workflow should trigger automatically
4. Check the Actions tab to monitor progress
5. The PR should be updated with processed changes

## Security Notes

- Never commit the PAT directly to the repository
- Rotate the PAT regularly (every 90 days recommended)
- Use the minimum required permissions
- Consider using a dedicated bot account for production environments