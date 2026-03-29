---
description: How to deploy the Wiqaiah Platform to GitHub Pages
---

To deploy the application to GitHub Pages using the prepared GitHub Action, follow these steps:

1. **Commit and Push to GitHub**:
   Ensure all your changes are committed to the `main` branch.
   ```bash
   git add .
   git commit -m "feat: setup automated deployment"
   git push origin main
   ```

2. **Configure GitHub Secrets**:
   Since the app uses Supabase, you must add your environment variables as Secrets in your GitHub Repository:
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Secrets and variables** > **Actions**.
   - Add the following **New repository secrets**:
     - `VITE_SUPABASE_URL`: Your Supabase Project URL.
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

3. **Enable GitHub Pages**:
   - In your repository, go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, change it to **GitHub Actions**.

4. **Monitor Deployment**:
   - Go to the **Actions** tab in your repository.
   - You should see a workflow named "Deploy to GitHub Pages" running.
   - Once completed, your site will be available at: `https://MostafaVipeCoder.github.io/wiqaiah/`
