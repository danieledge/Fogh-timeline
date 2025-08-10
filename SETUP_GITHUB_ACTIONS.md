# GitHub Actions Setup for Timeline Updates

## Problem
The GitHub Actions bot doesn't have permission to push changes to Staticman PRs by default.

## Solution Options

### Option 1: Use Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to https://github.com/settings/tokens/new
   - Name: `Timeline Bot PAT`
   - Expiration: Choose based on your needs
   - Scopes needed:
     - ✅ `repo` (Full control of private repositories)
   - Click "Generate token"
   - Copy the token (starts with `ghp_`)

2. **Add token to repository secrets:**
   - Go to your repository: https://github.com/danieledge/Fogh-timeline
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `PAT_TIMELINE_BOT`
   - Value: Paste your token
   - Click "Add secret"

3. **Test the workflow:**
   - Submit a test entry via admin panel
   - The workflow should now be able to push changes

### Option 2: Use the Simple Workflow (No PAT needed)

The `process-staticman-simple.yml` workflow creates a separate PR instead of modifying the Staticman PR:

1. Staticman creates PR #1 with JSON data
2. GitHub Action creates PR #2 with timeline-data.js changes
3. You merge PR #2 and close PR #1

This doesn't require a PAT but creates two PRs.

### Option 3: Enable GitHub Actions Write Permission

1. Go to Settings → Actions → General
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Check "Allow GitHub Actions to create and approve pull requests"
5. Save

This might work but depends on your repository settings.

## Testing

After setup, test with:
1. Open `/test-admin-entry.html`
2. Click "Submit Test Entry"
3. Check GitHub Actions tab
4. Verify the workflow completes successfully

## Workflows Included

- **process-staticman-admin.yml** - Main workflow (needs PAT)
- **process-staticman-simple.yml** - Alternative that creates new PR (no PAT)
- **apply-timeline-update.yml** - Manual trigger backup

## Troubleshooting

If you see "Permission denied" errors:
1. Check the PAT is correctly set in secrets
2. Ensure the PAT has `repo` scope
3. Try the simple workflow as a fallback
4. Check repository Settings → Actions → General for permissions