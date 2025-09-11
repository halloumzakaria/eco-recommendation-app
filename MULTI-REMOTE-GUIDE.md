# 🔄 Multi-Remote Git Setup: GitLab + GitHub

Your Ecosphere application is now connected to both GitLab (school) and GitHub (deployment)!

## 📋 Current Setup

- **GitLab (origin)**: `https://rendu-git.etna-alternance.net` - Your school repository
- **GitHub (github)**: `https://github.com/maryamnajari/ecosphere-app` - Your deployment repository

## 🚀 How to Work with Both Remotes

### **1. Push to Both Repositories**

When you make changes, you can push to both:

```bash
# Push to GitLab (school)
git push origin master

# Push to GitHub (deployment)
git push github master

# Or push to both at once
git push origin master && git push github master
```

### **2. Use the Push Script**

I've created a script to push to both remotes easily:

```bash
# Make the script executable (already done)
chmod +x push-both.sh

# Push to both repositories
./push-both.sh
```

### **3. Workflow Examples**

#### **Daily Development Workflow:**

```bash
# 1. Make your changes
# 2. Add and commit changes
git add .
git commit -m "Add new feature"

# 3. Push to both repositories
./push-both.sh
```

#### **School Assignment Submission:**

```bash
# Push only to GitLab (school)
git push origin master
```

#### **Deployment Update:**

```bash
# Push only to GitHub (deployment)
git push github master
```

### **4. Branch Management**

You can also work with branches on both remotes:

```bash
# Create a new branch
git checkout -b feature/new-feature

# Push branch to both remotes
git push origin feature/new-feature
git push github feature/new-feature

# Or use the script for the current branch
./push-both.sh
```

### **5. Railway Deployment Setup**

Now that you have GitHub connected, you can deploy to Railway:

1. **Go to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Connect GitHub** and select `ecosphere-app`
5. **Configure environment variables** (see DEPLOYMENT-GUIDE.md)
6. **Deploy!**

### **6. Environment Variables for Railway**

Set these in your Railway project:

```bash
NODE_ENV=production
SECRET_KEY=your_super_secret_jwt_key_here
POSTGRES_PASSWORD=your_secure_password_here
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_NLP_API_URL=https://your-nlp-url.railway.app
```

### **7. Benefits of This Setup**

✅ **School Work**: Keep your GitLab repository for assignments and grading
✅ **Deployment**: Use GitHub for easy deployment to Railway
✅ **Backup**: Your code is backed up in two places
✅ **Flexibility**: Choose which remote to push to based on your needs
✅ **Professional**: GitHub is widely used in the industry

### **8. Troubleshooting**

#### **If GitHub push fails:**
```bash
# Check if GitHub repository exists
# Make sure you have push permissions
# Verify the remote URL is correct
git remote get-url github
```

#### **If GitLab push fails:**
```bash
# Check your school credentials
# Verify you have access to the repository
git remote get-url origin
```

### **9. Quick Commands Reference**

```bash
# Check all remotes
git remote -v

# Push to specific remote
git push origin master    # GitLab (school)
git push github master    # GitHub (deployment)

# Push to both
./push-both.sh

# Check status
git status

# See commit history
git log --oneline
```

## 🎯 **Next Steps**

1. **Test the setup**: Make a small change and push to both repositories
2. **Deploy to Railway**: Use the GitHub repository for deployment
3. **Keep both updated**: Use `./push-both.sh` for regular updates

---

**Happy coding with dual repositories! 🚀**
