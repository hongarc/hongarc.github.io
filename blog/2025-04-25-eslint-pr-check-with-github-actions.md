---
title: "Implementing ESLint Checks on Changed Files in GitHub Pull Requests"
description: "Learn how to configure a GitHub Actions workflow that runs ESLint only on modified files in a pull request and fails the check if errors are found."
tags: [github-actions, eslint, nodejs, continuous-integration, development]
authors: [Hongarc]
---

# Implementing ESLint Checks on Changed Files in GitHub Pull Requests

## Introduction

Linting tools like **ESLint** are critical in maintaining code quality and enforcing best practices in a project. However, running ESLint across the entire codebase in every pull request (PR) can be inefficient, especially when only a few files have changed.

In this guide, we will show you how to configure **GitHub Actions** to run ESLint only on the files modified in a PR. This setup improves feedback speed and ensures that merged code does not introduce new linting errors.

---
<!-- truncate -->

## Why This Workflow Matters

In fast-moving teams, it's common to merge a pull request assuming everything is fine, only to realize afterward that new lint errors were introduced. This workflow addresses that issue by catching lint problems **before merge**, on **only the changed files**, reducing CI time and preventing regressions.

---

## Step 1: Set Up ESLint in a Node.js Project

First, ensure your project has ESLint configured.

### Initialize a Node.js Project and Add ESLint

```bash
npm init -y
npm install eslint --save-dev
npx eslint --init
```

Choose your preferences during the `eslint --init` setup process.

### Create a Sample File to Test

```bash
mkdir src
echo "const foo = 42" > src/index.js
```

### Add a Lint Script to `package.json`

```json
"scripts": {
  "lint": "eslint ."
}
```

---

## Step 2: Configure GitHub Actions

We’ll now create a GitHub Actions workflow that runs on PRs and executes ESLint only on the modified files.

### Create the Workflow File

Create a file at `.github/workflows/eslint.yml`:

```yaml
name: ESLint PR Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  eslint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - run: npm ci

      - name: Get Changed Files
        id: files
        run: |
          echo "CHANGED_FILES=$(git diff --name-only origin/${{ github.base_ref }}...HEAD -- '*.js' '*.ts' '*.jsx' '*.tsx' | paste -sd ' ' -)" >> $GITHUB_OUTPUT

      - name: Run ESLint on Changed Files
        if: steps.files.outputs.CHANGED_FILES != ''
        run: |
          npx eslint ${{ steps.files.outputs.CHANGED_FILES }} --format stylish
```

---

## Step 3: View the ESLint Output

The lint results will be printed to the GitHub Actions log using the `stylish` formatter. This makes it easy to review issues directly from the Actions tab.

Example output in the log:

```text
src/index.js
  1:7  error  'foo' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)
```

---

## Conclusion

By integrating ESLint into your GitHub PR workflow and limiting checks to changed files, you create a fast, efficient, and reliable CI pipeline. This ensures your main branch remains clean while speeding up the review process.

Want to explore how to upload the ESLint report as an artifact or fail the job based on custom logic? Let me know!
