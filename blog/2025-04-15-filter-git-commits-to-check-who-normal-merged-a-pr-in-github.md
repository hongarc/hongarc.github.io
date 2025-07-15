---
title: 'Filter Git Commits to Check Who Normal Merged a PR in GitHub'
description: 'Learn how to filter Git commits to identify who merged a PR and exclude irrelevant commits using a simple bash script.'
tags: [git, github, commits, merge, pr]
authors: [Hongarc]
---

## Filter Git Commits to Check Who Merged a PR in GitHub

In this post, I’ll show you how to filter **Git commits** to **check who merged a pull request** (PR) in GitHub. This script will help you:

- **Identify who merged the PR** without using squash merges.
- **Exclude** merges from `master`, `pick` code, or releases.

---

<!-- truncate -->

### 1. **Why Use This?**

When reviewing commit history in GitHub, you might want to **check who merged a pull request**. By default, GitHub sets the **committer** as `GitHub <noreply@github.com>` when the PR is merged. However, you may also want to **exclude** certain types of commits, such as:

- **Merges from `master`** (e.g., message includes `master`).
- **Commits with the keyword `pick`** (which is used in interactive rebase).
- **Commits related to releases** (e.g., message includes `releas`).

This script allows you to filter and format the output to **show only relevant merge commits**.

---

### 2. **Basic Command**

Start with the basic command to get all commit details from the last **two months**:

```bash
git log --since="2 months ago" --pretty=format:"commit %H%nAuthor: %an <%ae>%nCommitter: %cn <%ce>%n%s%n"
```

This command shows:

- **Commit hash**
- **Author** and **committer** details
- **Commit message**

---

### 3. **Filter by GitHub Committer**

To focus on commits merged by **GitHub**, where the committer is `GitHub <noreply@github.com>`, you can filter the output like this:

```bash
git log --since="2 months ago" --pretty=format:"commit %H%nAuthor: %an <%ae>%nCommitter: %cn <%ce>%n%s%n" \
  | awk '/GitHub <noreply@github.com>/ {print}'
```

---

### 4. **Exclude Specific Keywords (master, pick, releas)**

Now, let’s enhance the command to **exclude** commits related to:

- **Merges from master** (commit message includes `master`).
- **Pick commits** (used in rebasing).
- **Release commits** (commit message includes `releas`).

Here’s the full command:

```bash
git log --since="2 months ago" --pretty=format:"commit %H%nAuthor: %an <%ae>%nCommitter: %cn <%ce>%nDate: %ad%n%s%n" \
  | awk '
    BEGIN { IGNORECASE = 1 }
    /^commit / {commit=$0; author=""; date=""; message=""}
    /^Author:/ {author=$0}
    /^Date:/ {date=$0}
    /^Committer: GitHub <noreply@github.com>$/ {in_block=1}
    /^Committer:/ && $0 !~ /GitHub <noreply@github.com>/ {in_block=0}
    in_block && /Merge pull request/ && $0 !~ /releas/ && $0 !~ /master/ && $0 !~ /pick/ {
      printf "\n🔹 `%s`\n👤 %s\n📅 %s\n📝 %s\n",
        substr(commit, 8), author, date, $0;
      print "--------------------------------------------"
      in_block=0
    }
  '
```

#### What This Does

- **`IGNORECASE = 1`**: Makes the script case-insensitive.
- Filters for **merge commits** (`Merge pull request`).
- Excludes commits with `releas`, `master`, or `pick` in the message.
- Shows output with **commit hash**, **author**, **date**, and **message** in a clean format.

---

### 5. **Example Output**

The output will be formatted like this:

```
🔹 `9e535dda117d14d582eff21bdb0f754590dbf528`
👤 Author: Đắc Chiến <chienxxx@gmail.com>
📅
📝 Merge pull request #11729 from Everfit-io/dev_s121.refactor/UP-xxxxx
```

### 6. **Conclusion**

This command helps you:

- **Identify who merged the PR** by filtering for commits made by `GitHub` as the committer.
- **Exclude** commits with specific keywords.
- **Display the results** in a clean, readable format, making it easier to track PR merges.

This is a great tool for reviewing Git commit history, especially when you need to focus on specific types of merges and exclude irrelevant ones.
