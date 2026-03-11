# Setup Guide

## Step-by-Step Setup

### 1. Get Cloudinary Credentials

1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up for a free account
3. After signing in, you'll see your dashboard
4. Copy these three values:
   - **Cloud Name** (e.g., "dxxxxx")
   - **API Key** (e.g., "123456789012345")
   - **API Secret** (e.g., "abcdefghijklmnopqrstuvwxyz")

### 2. Configure Environment

```bash
# Navigate to project
cd /home/cheeku1855/internship/cloudinary-manager

# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your credentials
nano .env.local
```

Your `.env.local` should look like:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### 3. Install and Run

```bash
# Install dependencies (if not done already)
npm install

# Run development server
npm run dev
```

### 4. Test the Application

1. Open http://localhost:3000
2. Try uploading an image
3. Create a folder
4. Upload an image to the folder
5. Test delete, copy URL, and download features

## Troubleshooting

### Error: "No file provided"
- Make sure you're selecting image files only
- Check file size (max 10MB on free tier)

### Error: "Upload failed"
- Verify your API credentials in `.env.local`
- Check Cloudinary dashboard is accessible
- Restart the dev server after changing `.env.local`

### Images not showing
- Check browser console for errors
- Verify CLOUD_NAME is correct
- Try clearing browser cache

### Folder creation fails
- This is normal - folders appear when they contain images
- Upload an image to the folder to make it visible

## Next Steps

After successful setup:
1. Customize the UI in `components/`
2. Add search functionality
3. Implement bulk operations
4. Add image transformations
5. Deploy to production

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --build

# Set environment variables in Netlify dashboard
```

## Support

- Cloudinary Docs: https://cloudinary.com/documentation
- Next.js Docs: https://nextjs.org/docs
- TanStack Query: https://tanstack.com/query/latest

---

Happy coding! 🚀
