# Jenkins CI/CD Pipeline for Node.js with GitHub PR Automation

## Overview
This project sets up a **Jenkins declarative pipeline** for a Node.js application integrated with GitHub.  
It automates pull requests (PR) and merges between `feature`, `develop`, and `main` branches with test validation and email notifications.

---

## Pipeline Flow
1. **Feature Branch → Develop**
   - Developer pushes code to a `feature/*` branch.
   - Jenkins triggers pipeline.
   - Runs `npm install` and `npm test`.
   - If tests pass → Jenkins creates a PR from feature → develop and merges it automatically.
   - If tests fail → Email notification is sent, and pipeline stops.

2. **Develop Branch → Main**
   - Jenkins triggers when code is in `develop` branch.
   - Requires **manual approval** before merging.
   - Jenkins creates a PR from develop → main and merges automatically after approval.

3. **Main Branch**
   - No PRs created. This branch only receives merges from develop.

---

## Features
- ✅ Node.js dependency installation & testing (`npm install`, `npm test`).
- ✅ Email notifications on test failures (`NOTIFY_EMAIL` env variable).
- ✅ GitHub PR automation using `gh cli`.
- ✅ Automatic merge from feature → develop, manual approval for develop → main.
- ✅ Clean workspace after every run.

---

## Configuration Required
1. **Jenkins Plugins**
   - GitHub Branch Source Plugin
   - Pipeline Plugin
   - Email Extension Plugin

2. **Credentials**
   - GitHub Token → saved in Jenkins as `github-token`.
   - SMTP Email configured in Jenkins for sending failure notifications.

3. **Environment Variables**
   ```groovy
   environment {
       REPO        = "https://github.com/LasyaSriG/nodeJS"
       BASE_BRANCH = "develop"
       NOTIFY_EMAIL = "your_email@example.com"
   }
   ```

4. **Branch Protection Rules**
   - Protect `develop` and `main` in GitHub to avoid direct pushes.

---

## Jenkinsfile Highlights
- Uses `${CHANGE_BRANCH:-$BRANCH_NAME}` to correctly detect source branch in PR builds.
- Sends failure notifications via email.
- Handles existing PR gracefully (reuses if already open).
- Cleans workspace after every build.

---

# Error Fix Write-Up

## Issue 1: PR-xx Detached Ref Error
**Error:**  
```
fatal: couldn't find remote ref PR-24
```
**Cause:** Jenkins PR builds use `CHANGE_BRANCH` instead of `BRANCH_NAME` for source branch.  
**Fix:**  
```bash
SRC_BRANCH="${CHANGE_BRANCH:-$BRANCH_NAME}"
```

---

## Issue 2: Tests Passing but Bad Code Merging
**Cause:** Pipeline merged even if tests failed.  
**Fix:** Wrapped `npm test` in `try/catch` and aborted pipeline with `error()` if tests failed.

---

## Issue 3: Email Notifications
**Improvement:** Instead of dynamically fetching commit author, added `NOTIFY_EMAIL` in environment block.  
This ensures all failure alerts go to the right person/group.

---

# Final Outcome
- Fully automated CI/CD with safe merges and notifications.  
- Cleaner PR process with approvals.  
- Stable and reliable Jenkins pipeline ready for production.
