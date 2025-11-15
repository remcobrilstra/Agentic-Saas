# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. PR Validation (`pr-validation.yml`)

Runs on every pull request to the `main` branch.

**Jobs:**
- **Lint**: Runs ESLint to check code quality
- **Build**: Builds the Next.js application to ensure no build errors
- **Test**: Runs unit tests (currently skips if no tests are configured)

**Notes:**
- The build job uses dummy environment variables to allow the build to complete
- Real environment variables will be configured in Vercel for production

### 2. Deploy to Vercel (`deploy-vercel.yml`)

Runs on every push to the `main` branch to deploy the application to Vercel.

**Required Secrets:**

To enable Vercel deployment, you need to configure the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **VERCEL_TOKEN**: Your Vercel authentication token
   - Get it from: https://vercel.com/account/tokens
   
2. **VERCEL_ORG_ID**: Your Vercel organization/team ID
   - Get it from your `.vercel/project.json` file after running `vercel link` locally
   
3. **VERCEL_PROJECT_ID**: Your Vercel project ID
   - Get it from your `.vercel/project.json` file after running `vercel link` locally

**Setup Instructions:**

1. Install Vercel CLI locally:
   ```bash
   npm install -g vercel
   ```

2. Link your project to Vercel:
   ```bash
   vercel link
   ```

3. This creates a `.vercel/project.json` file with your org and project IDs

4. Get your Vercel token from https://vercel.com/account/tokens

5. Add all three secrets to your GitHub repository settings

6. Configure environment variables in your Vercel project dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL`

## Local Testing

Before pushing changes, you can test locally:

```bash
# Run lint
npm run lint

# Run build
npm run build

# Run tests (when available)
npm test
```

## Troubleshooting

### Build fails with "supabaseUrl is required"

This means environment variables are not properly configured. For local builds, create a `.env.local` file with your environment variables. For CI/CD, ensure the workflow has the necessary env vars or secrets configured.

### Vercel deployment fails

1. Verify all three secrets are correctly set in GitHub
2. Ensure your Vercel project is properly configured
3. Check that environment variables are set in your Vercel project dashboard
4. Review the workflow logs for specific error messages
