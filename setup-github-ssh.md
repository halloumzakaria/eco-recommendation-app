# 🔐 GitHub SSH Setup Guide

## Generate SSH Key

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519
```

## Add SSH Key to GitHub

1. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. **Go to GitHub.com** → **Settings** → **SSH and GPG keys**
3. **Click "New SSH key"**
4. **Paste your public key**
5. **Click "Add SSH key"**

## Update Git Remote to Use SSH

```bash
# Change remote URL to SSH
git remote set-url github git@github.com:maryamnajari/eco-recommendation-app.git

# Test SSH connection
ssh -T git@github.com

# Push to GitHub
git push -u github master
```

## Alternative: Use Personal Access Token

If you prefer to use a token:

1. **Create token** at GitHub.com → Settings → Developer settings → Personal access tokens
2. **When Git asks for password, use the token instead**
3. **Username:** maryamnajari
4. **Password:** [paste your token here]
