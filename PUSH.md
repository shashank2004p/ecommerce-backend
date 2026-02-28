# Push backend to a separate repo

This folder (spsellbe) is its own git repo and can be pushed to a **different** GitHub repo.

## 1. Create a new repo on GitHub

- Go to https://github.com/new
- Name it e.g. **ecommerce-backend** (or **spsellbe**)
- Do **not** add README, .gitignore, or license (we already have them)
- Create the repo

## 2. Add remote and push

From this folder (`spsellbe`):

```bash
cd /home/shashank-parmar/Desktop/spsell/spsellbe

# Add your new repo as origin (replace with your repo URL)
git remote add origin https://github.com/shashank2004p/ecommerce-backend.git

# Or with SSH:
# git remote add origin git@github.com:shashank2004p/ecommerce-backend.git

git branch -M main
git push -u origin main
```

## Current setup

- **ecommerce** repo (existing): frontend at root + `spsellbe/` folder
- **ecommerce-backend** repo (new): backend only, from this folder

If you later want the **ecommerce** repo to contain only frontend, you can remove the `spsellbe` folder from that repo and push (backend will live in the new repo).
