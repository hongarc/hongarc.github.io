---
title: 'Running a Node.js App with User-Entered Input in GitHub Actions'
description: 'Learn how to create a GitHub Actions workflow that accepts user input, passes it to a Node.js script, and validates the input format.'
tags: [github-actions, nodejs, automation, development]
authors: [Hongarc]
---

# Running a Node.js App with User-Entered Input in GitHub Actions

## Introduction

GitHub Actions provides a powerful way to automate workflows, including running a Node.js application with user-entered inputs. In this guide, we will create a GitHub Actions workflow that allows users to enter a **date** manually, pass it to a **Node.js script**, and validate the input format.

---

<!-- truncate -->

## Step 1: Define the GitHub Actions Workflow

We will define a workflow that allows users to input a date and then run a Node.js script with that input.

### **`.github/workflows/run-node.yml`**

```yaml
name: Run Node.js with User Input

on:
  workflow_dispatch:
    inputs:
      date:
        description: 'Enter a date (YYYY-MM-DD)'
        required: true
        type: string

jobs:
  run_node_app:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18 # Specify your Node.js version

      - name: Install dependencies
        run: npm install # Ensure you have a package.json file

      - name: Run Node.js script with date input
        run: node script.js
        env:
          INPUT_DATE: ${{ github.event.inputs.date }}
```

### **How It Works:**

1. The workflow triggers when a user manually runs it via **GitHub Actions**.
2. The user must enter a **date** in `YYYY-MM-DD` format.
3. The entered date is stored as an **environment variable** (`INPUT_DATE`).
4. A Node.js script (`script.js`) is executed using this input.

---

## Step 2: Create the Node.js Script

We need a script that reads the user input, validates the format, and performs an action based on the input.

### **`script.js`**

```javascript
// script.js

// Get the user input from environment variables
const inputDate = process.env.INPUT_DATE;

if (!inputDate) {
  console.error('❌ Error: No date provided.');
  process.exit(1);
}

// Validate the format (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(inputDate)) {
  console.error('❌ Error: Invalid date format. Use YYYY-MM-DD.');
  process.exit(1);
}

console.log(`✅ Received valid date: ${inputDate}`);

// Further processing can be done here...
```

### **Explanation:**

- `process.env.INPUT_DATE` retrieves the input date from GitHub Actions.
- The script validates the format using a **regular expression**.
- If the format is incorrect, it throws an error (`process.exit(1)`).
- If valid, it prints a success message and can be used for further processing.

---

## Step 3: Running the Workflow

To execute this workflow:

1. **Go to your GitHub repository** → Click on the **Actions** tab.
2. Select the **Run Node.js with User Input** workflow.
3. Click **Run workflow**.
4. Enter the date in `YYYY-MM-DD` format (e.g., `2025-04-02`).
5. Click **Run workflow**.
6. The Node.js script will execute with the provided date.

---

## Step 4: Handling Additional Validations (Optional)

### **Checking If the Date Is in the Past**

Modify `script.js` to prevent users from entering past dates:

```javascript
const inputDateObj = new Date(inputDate);
const today = new Date();

if (inputDateObj < today) {
  console.error('❌ Error: The date cannot be in the past.');
  process.exit(1);
}
```

### **Using the Date in an API Call**

```javascript
fetch(`https://example.com/api/data?date=${inputDate}`)
  .then(response => response.json())
  .then(data => console.log('📊 Data received:', data))
  .catch(error => console.error('❌ API Error:', error));
```

---

## Conclusion

By following these steps, you can create a GitHub Actions workflow that allows users to manually enter a **date**, pass it to a **Node.js script**, and validate the input before using it in your application.

This setup is useful for tasks like scheduling jobs, logging user inputs, or triggering time-sensitive processes.

Would you like to extend this workflow to include **database updates or API calls**? Let me know in the comments! 🚀
