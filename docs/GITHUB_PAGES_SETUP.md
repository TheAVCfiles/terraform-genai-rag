# GitHub Pages Setup Guide

This guide explains how to enable GitHub Pages for the interactive visualizations in this repository.

## Quick Setup

### Enable GitHub Pages

1. Navigate to your repository on GitHub
2. Click on **Settings** (gear icon)
3. In the left sidebar, click **Pages** under "Code and automation"
4. Under **Source**, configure the following:
   - **Branch**: Select `main` (or your default branch)
   - **Folder**: Select `/docs`
5. Click **Save**
6. Wait 1-3 minutes for GitHub to build and deploy your site

### Access Your Visualizations

Once deployed, your visualizations will be available at:

```
https://theavcfiles.github.io/terraform-genai-rag/
```

Direct links:
- **Main Portal**: `https://theavcfiles.github.io/terraform-genai-rag/`
- **Syvaq Visualization**: `https://theavcfiles.github.io/terraform-genai-rag/Syvaq_Miracle_Cache_Synthesis.html`

## Verification

To verify your GitHub Pages deployment:

1. Go to **Settings** → **Pages**
2. You should see a message: "Your site is live at https://theavcfiles.github.io/terraform-genai-rag/"
3. Click the link to visit your site
4. If you see an error, wait a few more minutes and refresh

## Troubleshooting

### Site Not Deploying

**Problem**: Changes aren't showing up on the live site

**Solutions**:
1. Check that GitHub Pages is enabled (Settings → Pages)
2. Verify the source is set to `/docs` folder from the correct branch
3. Wait up to 10 minutes for changes to propagate
4. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
5. Check the Actions tab for build errors

### 404 Error

**Problem**: Getting a 404 error when visiting the site

**Solutions**:
1. Ensure the `/docs` folder exists in your repository
2. Verify `index.html` exists in the `/docs` folder
3. Check that the branch selected in Pages settings contains the `/docs` folder
4. Wait a few minutes after enabling Pages for the first time

### Styles Not Loading

**Problem**: Page loads but styles/scripts don't work

**Solutions**:
1. Verify the `.nojekyll` file exists in the `/docs` folder
2. Check browser console for errors (F12 → Console)
3. Ensure CDN resources (React, Babel) are accessible
4. Try accessing the site in an incognito/private window

## File Structure

The `/docs` folder must contain:

```
docs/
├── .nojekyll                              # Disables Jekyll processing
├── README.md                              # Documentation
├── GITHUB_PAGES_SETUP.md                  # This file
├── index.html                             # Main landing page
└── Syvaq_Miracle_Cache_Synthesis.html     # Visualization
```

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain name
3. Add a CNAME record in your DNS settings pointing to:
   ```
   theavcfiles.github.io
   ```
4. Wait for DNS propagation (can take up to 24 hours)
5. Check "Enforce HTTPS" once the domain is verified

## Monitoring Deployments

### GitHub Actions

Every push to the repository triggers a GitHub Pages build:

1. Go to the **Actions** tab
2. Look for "pages build and deployment" workflows
3. Click on a workflow to see deployment details
4. Green checkmark = successful deployment
5. Red X = failed deployment (click for error details)

### Build Status

Add a badge to your README to show deployment status:

```markdown
![GitHub Pages](https://github.com/TheAVCfiles/terraform-genai-rag/workflows/pages-build-deployment/badge.svg)
```

## Security Considerations

- GitHub Pages sites are always public, even for private repositories
- Don't include sensitive data in files in the `/docs` folder
- The `.nojekyll` file prevents GitHub from processing files, improving security
- All external resources (React, etc.) are loaded from trusted CDNs

## Performance Optimization

The visualizations are optimized for GitHub Pages:

1. **Self-contained HTML files**: No build process required
2. **CDN resources**: React and Babel loaded from unpkg.com
3. **No Jekyll processing**: `.nojekyll` file improves load times
4. **Minimal dependencies**: Everything needed is in the HTML file

## Local Development

Test the visualizations locally before deploying:

### Option 1: Simple HTTP Server (Python)

```bash
cd docs
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Option 2: Node.js HTTP Server

```bash
cd docs
npx http-server -p 8000
# Visit http://localhost:8000
```

### Option 3: Direct File Access

Simply open `docs/index.html` in your web browser. Note: Some features may not work due to CORS restrictions.

## Adding New Visualizations

To add a new visualization:

1. Create a self-contained HTML file in the `/docs` folder
2. Add a link to it in `docs/index.html`
3. Update `docs/README.md` with details
4. Commit and push changes
5. Wait for GitHub Pages to rebuild (1-3 minutes)

Example:

```html
<!-- In docs/index.html -->
<div class="viz-card">
    <h2>New Visualization Name</h2>
    <p>Description of the visualization...</p>
    <a href="new_visualization.html">Launch Visualization →</a>
</div>
```

## Support

For issues with:
- **GitHub Pages setup**: Check [GitHub Pages documentation](https://docs.github.com/en/pages)
- **Visualizations**: See `docs/README.md`
- **Repository**: Open an issue in the repository

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Quickstart](https://docs.github.com/en/pages/quickstart)
- [Troubleshooting GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)
