---
slug: auto-github-release
title: Automate GitHub Releases and Changelog Updates with GitHub Actions
authors: [Hongarc]
tags: [github-actions, automation, release-management]
---

# Automate GitHub Releases and Changelog Updates with GitHub Actions

## Introduction
Keeping track of changes in a project is essential, but manually updating the changelog and creating releases can be tedious. In this blog, we'll automate the process using **GitHub Actions** to:
- Run a workflow **on the 1st of every month** (or manually).
- Extract the **latest commit messages**.
- Update **CHANGELOG.md** automatically.
- Create a **new GitHub release** using the updated `CHANGELOG.md`.

<!-- truncate -->

By the end, you'll have a fully automated workflow that keeps your releases up to date without manual effort.

---

## Step 1: Create the GitHub Actions Workflow
To get started, create the following workflow file in your GitHub repository:

📂 **`.github/workflows/auto-release.yml`**

```yaml
name: Auto Release

on:
  schedule:
    - cron: "0 0 1 * *"  # Runs on the 1st of every month
  workflow_dispatch:  # Allows manual triggering

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Get current date
        id: date
        run: echo "date=$(date +'%Y-%m-%d')" >> $GITHUB_ENV

      - name: Get latest commit messages
        id: commits
        run: echo "commits=$(git log --pretty=format:'- %s' -n 10)" >> $GITHUB_ENV

      - name: Update CHANGELOG.md
        run: |
          echo "## Release ${{ env.date }}" > tmpfile
          echo "" >> tmpfile
          echo "${{ env.commits }}" >> tmpfile
          echo "" >> tmpfile
          cat CHANGELOG.md >> tmpfile || true
          mv tmpfile CHANGELOG.md

      - name: Commit and push CHANGELOG.md
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md
          git commit -m "chore(release): update CHANGELOG for ${{ env.date }}"
          git push

      - name: Create GitHub release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: "release-${{ env.date }}"
          name: "Release ${{ env.date }}"
          body_path: "CHANGELOG.md"
          draft: false
          prerelease: false
```

---

## Step 2: How the Workflow Works
This workflow does the following:
1. **Runs automatically** on the 1st of each month (or manually via `workflow_dispatch`).
2. **Extracts the last 10 commit messages**.
3. **Updates `CHANGELOG.md`**, appending the new release.
4. **Commits & pushes the updated `CHANGELOG.md`**.
5. **Creates a GitHub release**, using `CHANGELOG.md` as the release notes.

---

## Step 3: Example `CHANGELOG.md` Output
After the workflow runs, `CHANGELOG.md` will look something like this:

```md
## Release 2025-03-01
- Added auto-release workflow
- Improved error handling

## Release 2025-02-01
- Fixed login bug
- Updated UI design
```

Each new release will automatically prepend a section with the latest commit messages.

---

## Step 4: Customizing the Workflow
You can modify this workflow to fit your needs:
- Change the **cron schedule** (`0 0 1 * *`) to run on a different day.
- Adjust the **number of commits extracted** (`-n 10` in `git log`).
- Modify the **commit message format**.

---

## Conclusion
With this GitHub Actions workflow, your releases and changelog updates are fully automated! No more manual tracking—your project stays updated with minimal effort.

Give it a try and let me know if you have any questions! 🚀
