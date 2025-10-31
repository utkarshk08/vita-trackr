# Git & GitHub Setup Instructions

Follow these steps to push your VitaTrackr project to GitHub.

## Prerequisites

1. GitHub account ([Sign up here](https://github.com/signup) if you don't have one)
2. Git installed on your computer

## Steps to Push to GitHub

### 1. Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com)
2. Click the **"+" icon** in the top right corner
3. Select **"New repository"**
4. Repository details:
   - **Name**: `vita-trackr` (or any name you prefer)
   - **Description**: "Complete health tracking web application with AI-powered recommendations"
   - **Visibility**: Choose **Public** (or Private if you prefer)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### 2. Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd /Users/utkarshkhandelwal/Downloads/vitaTrackr

# Add the remote repository (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/vita-trackr.git

# Check if remote was added correctly
git remote -v
```

### 3. Push Your Code to GitHub

```bash
# Push your code to GitHub
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your regular password)

### 4. Create a Personal Access Token (if needed)

If Git asks for a password:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: `vita-trackr-push`
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

## Alternative: Using SSH (Recommended for future)

### Setup SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519

# Display public key (copy this)
cat ~/.ssh/id_ed25519.pub
```

Then add the public key to GitHub:
1. GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste your public key
4. Save

Update remote URL:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/vita-trackr.git
git push -u origin main
```

## Verify Your Push

1. Go to `https://github.com/YOUR_USERNAME/vita-trackr`
2. You should see all your files there!
3. Check the README.md to ensure it renders correctly

## Future Updates

Whenever you make changes, use these commands:

```bash
# Check what files changed
git status

# Add changed files
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

## Project Structure on GitHub

Your repository should show:
```
vita-trackr/
├── .gitignore
├── README.md
├── MONGODB_SETUP.md
├── GIT_SETUP.md
├── index.html
├── scripts/
│   ├── database.js
│   ├── main.js
│   └── smartRecommendations.js
└── styles/
    └── main.css
```

## Additional GitHub Features

### Add a License

```bash
# Create MIT license
curl https://choosealicense.com/licenses/mit/ > LICENSE

git add LICENSE
git commit -m "Add MIT license"
git push
```

### Enable GitHub Pages (Free Hosting!)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **"Deploy from a branch"**
4. Choose branch: **"main"** and folder: **"/"** (root)
5. Click **Save**
6. Your app will be live at: `https://YOUR_USERNAME.github.io/vita-trackr`

### Add Topics (Tags)

1. On your repository page, click ⚙️ gear icon next to "About"
2. Add topics: `health`, `fitness`, `nutrition`, `web-app`, `javascript`, `html5`, `css3`, `mongodb`

## Troubleshooting

### Error: "Repository not found"
- Check your username and repository name
- Ensure the repository exists on GitHub
- Verify you have push access

### Error: "Authentication failed"
- Use Personal Access Token instead of password
- Check if your SSH key is added to GitHub

### Error: "Updates were rejected"
```bash
# Pull remote changes first
git pull origin main --rebase

# Then push
git push
```

### View Commit History
```bash
git log --oneline --graph --all
```

## Quick Reference

| Action | Command |
|--------|---------|
| Check status | `git status` |
| Add all files | `git add .` |
| Commit changes | `git commit -m "message"` |
| Push to GitHub | `git push` |
| Pull from GitHub | `git pull` |
| View history | `git log` |
| Create branch | `git branch feature-name` |
| Switch branch | `git checkout feature-name` |

## Next Steps After GitHub Setup

1. ✅ Push code to GitHub
2. ✅ Enable GitHub Pages (optional)
3. ✅ Set up MongoDB Atlas (see MONGODB_SETUP.md)
4. ⏭️ Add collaborators (if needed)
5. ⏭️ Set up CI/CD (optional)

---

**Congratulations! 🎉 Your VitaTrackr project is now on GitHub!**

