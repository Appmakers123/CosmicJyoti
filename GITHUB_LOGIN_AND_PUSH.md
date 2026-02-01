# 🔐 GitHub Login & Push Guide

## Step 1: Configure Git (If Not Done)

Open Command Prompt or PowerShell and run:

```bash
# Set your GitHub username
git config --global user.name "YourGitHubUsername"

# Set your GitHub email (must match GitHub account)
git config --global user.email "your.email@example.com"
```

**Important:** Use the email associated with your GitHub account.

---

## Step 2: Login to GitHub

### Option A: Using GitHub CLI (Recommended - Easiest)

1. **Install GitHub CLI** (if not installed):
   - Download from: https://cli.github.com/
   - Or use: `winget install GitHub.cli`

2. **Login**:
   ```bash
   gh auth login
   ```
   - Select: **GitHub.com**
   - Select: **HTTPS**
   - Authenticate: **Login with a web browser**
   - Copy the code shown and press Enter
   - Browser will open - paste code and authorize

3. **Verify login**:
   ```bash
   gh auth status
   ```

### Option B: Using Personal Access Token (Alternative)

1. **Create Token**:
   - Go to: https://github.com/settings/tokens
   - Click: **Generate new token** → **Generate new token (classic)**
   - Name: `cosmicjyoti-deploy`
   - Select scopes: ✅ **repo** (all repo permissions)
   - Click: **Generate token**
   - **COPY THE TOKEN** (you won't see it again!)

2. **Use Token**:
   - When pushing, use token as password
   - Username: Your GitHub username
   - Password: The token you copied

---

## Step 3: Initialize Git Repository

```bash
# Navigate to your project folder
cd C:\Users\Nikesh1.Maurya\Downloads\cosmicsutra

# Check if git is initialized
git status

# If not initialized, run:
git init
```

---

## Step 4: Create GitHub Repository

### Method 1: Using GitHub Website

1. Go to: https://github.com/new
2. Repository name: `cosmicjyoti` (or your choice)
3. Description: "Vedic AI Astrology App"
4. Visibility: **Public** (for free GitHub Pages)
5. **DO NOT** check "Add README" or other options
6. Click: **Create repository**

### Method 2: Using GitHub CLI

```bash
# Create repository from command line
gh repo create cosmicjyoti --public --description "Vedic AI Astrology App"
```

---

## Step 5: Add Files and Commit

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - CosmicJyoti production ready"
```

---

## Step 6: Connect and Push

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cosmicjyoti.git

# Or if using GitHub CLI, it's already connected:
# git remote add origin https://github.com/YOUR_USERNAME/cosmicjyoti.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Your Personal Access Token (if using Option B)

---

## Step 7: Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
1. Build your app
2. Deploy to `gh-pages` branch
3. Make it available on GitHub Pages

---

## Step 8: Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/cosmicjyoti/settings/pages`
2. Source: **Deploy from a branch**
3. Branch: **gh-pages**
4. Folder: **/ (root)**
5. Click: **Save**

Your site will be live at:
```
https://YOUR_USERNAME.github.io/cosmicjyoti/
```

---

## 🔧 Troubleshooting

### "Authentication failed"
- Check your username and token
- Regenerate token if expired
- Use GitHub CLI for easier authentication

### "Repository not found"
- Verify repository name matches
- Check you have access to the repository
- Ensure repository exists on GitHub

### "Permission denied"
- Check your token has `repo` scope
- Verify you're logged in: `gh auth status`

### "Remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add again
git remote add origin https://github.com/YOUR_USERNAME/cosmicjyoti.git
```

---

## ✅ Quick Commands Summary

```bash
# 1. Configure Git
git config --global user.name "YourUsername"
git config --global user.email "your@email.com"

# 2. Login to GitHub (if using CLI)
gh auth login

# 3. Initialize and commit
git init
git add .
git commit -m "Initial commit"

# 4. Create repository (if using CLI)
gh repo create cosmicjyoti --public

# 5. Connect and push
git remote add origin https://github.com/YOUR_USERNAME/cosmicjyoti.git
git branch -M main
git push -u origin main

# 6. Deploy
npm run deploy
```

---

## 🎯 Next Steps After Push

1. ✅ Code is on GitHub
2. ✅ Deploy to GitHub Pages: `npm run deploy`
3. ✅ Enable Pages in settings
4. ✅ Share your live URL!

---

**Need help?** Check the error message and refer to troubleshooting section above.
