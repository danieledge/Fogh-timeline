# Managing Timeline Submissions

## Workflow for Processing Submissions

### 1. Review Pull Request
- Go to PR page
- Review the submission data
- Check for accuracy and appropriateness

### 2. If Accepted:
```bash
# 1. Label the PR
# Add "accepted" label in GitHub UI

# 2. Copy the entry data from the PR

# 3. Manually add to timeline-data.js
# Edit timeline-data.js and add the new entry

# 4. Commit with reference
git add timeline-data.js
git commit -m "Add timeline entry: [Title] (from PR #123)"

# 5. Close the PR with comment
# "Thank you for your contribution! This entry has been added to the timeline in commit [hash]"
```

### 3. If Rejected:
- Add "rejected" label
- Close PR with polite explanation

### 4. If Needs Changes:
- Comment on PR requesting changes
- Add "needs-revision" label
- Leave open for submitter to see

## Benefits of This Approach:

1. **Clean History**: No merge commits for data files
2. **Control**: You decide exactly how entries are formatted
3. **Audit Trail**: PRs document all submissions
4. **Flexibility**: Can edit/improve entries before adding

## Setting Up Labels:

Go to: https://github.com/danieledge/Fogh-timeline/labels

Create these labels:
- `accepted` (green)
- `needs-review` (yellow) 
- `rejected` (red)
- `needs-revision` (orange)
- `duplicate` (gray)

## Automation Option:

Create a GitHub Action that:
1. Watches for PRs labeled "accepted"
2. Extracts the JSON data
3. Creates a new commit adding to timeline-data.js
4. Closes the PR