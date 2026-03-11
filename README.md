<div align="center">

# ☁️ Cloudinary Manager

**A sleek, full-featured media management dashboard built with Next.js 16 and Cloudinary.**

Upload, organise, and manage your cloud assets — faster than ever.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-SDK_v2-3448C5?logo=cloudinary)](https://cloudinary.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-ff4154)](https://tanstack.com/query)

![Cloudinary Manager Demo](https://res.cloudinary.com/dqdejwtwd/image/upload/f_auto,q_auto/gallilo/banners/order_food)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 **Drag & Drop Upload** | Drop images directly onto the upload zone — supports multiple files at once |
| 🗂️ **Folder Management** | Create, navigate, rename, and move nested folders |
| 🖼️ **Grid & List Views** | Toggle between a visual card grid and a compact list layout |
| 🔗 **Copy CDN URL** | One-click copy of the Cloudinary CDN URL with visual confirmation |
| ⬇️ **Download** | Open full-resolution image in a new tab for browser-native download |
| 🗑️ **Delete with Confirm** | Permanent deletion with a confirmation dialog to prevent accidents |
| ⚡ **Real-time Refresh** | TanStack Query automatically invalidates the cache after every operation |
| 📱 **Fully Responsive** | Mobile-first layout — works great on phones, tablets, and desktops |

---

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org)** — App Router, Server Actions, API Routes
- **[TypeScript 5](https://www.typescriptlang.org)** — End-to-end type safety
- **[Tailwind CSS 4](https://tailwindcss.com)** — Utility-first styling
- **[Cloudinary Node SDK v2](https://cloudinary.com/documentation/node_integration)** — Upload, transform, deliver
- **[TanStack Query v5](https://tanstack.com/query)** — Smart server-state caching
- **[Lucide React](https://lucide.dev)** — Crisp, consistent icons
- **[Axios](https://axios-http.com)** — Promise-based HTTP client

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A free [Cloudinary account](https://cloudinary.com/users/register_free)

### 1. Clone & Install

```bash
git clone https://github.com/vijay-2155/cloudnary-manager.git
cd cloudnary-manager
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Open `.env.local` and add your credentials from the [Cloudinary Console](https://console.cloudinary.com/):

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're live. 🎉

---

## 🗺️ Project Structure

```
cloudinary-manager/
├── app/
│   ├── api/
│   │   ├── upload/          # POST  — Upload images to Cloudinary
│   │   ├── resources/       # GET   — List images in a folder
│   │   ├── delete/          # DELETE — Permanently remove an image
│   │   └── folders/
│   │       ├── route.ts     # GET/POST — List & create folders
│   │       ├── rename/      # PUT   — Rename a folder
│   │       ├── move/        # PUT   — Move a folder
│   │       └── subfolders/  # GET   — List subfolders
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── FolderTree.tsx        # Collapsible sidebar folder tree
│   ├── CreateFolderModal.tsx # Modal for new folder creation
│   ├── ImageUpload.tsx       # Drag-and-drop upload zone
│   ├── ImageGrid.tsx         # Grid / List container with toggle
│   ├── ImageCard.tsx         # Individual image card with actions
│   └── Providers.tsx         # TanStack Query provider
├── lib/
│   ├── cloudinary.ts         # Cloudinary SDK config
│   ├── cloudinaryUtils.ts    # Thumbnail URL helper
│   └── types.ts              # Shared TypeScript types
├── .env.example              # Environment variable template
└── .env.local                # Your credentials (git-ignored)
```

---

## 🔌 API Reference

### `POST /api/upload`
Upload an image to Cloudinary.

```
Body (multipart/form-data):
  file    — File  (required)
  folder  — string (optional, defaults to root)

Response:
  { public_id, secure_url, width, height, format, bytes }
```

### `GET /api/resources?folder=path`
List all images inside a folder.

```
Response:
  { resources: CloudinaryResource[], total_count: number }
```

### `GET /api/folders`
List all root-level folders.

### `POST /api/folders`
Create a new folder.

```
Body: { path: string }
Response: { success: boolean, folder: string }
```

### `DELETE /api/delete`
Permanently delete an image.

```
Body: { public_id: string, resource_type?: string }
Response: { success: boolean, result: string }
```

---

## ☁️ Deployment

### Vercel (Recommended — zero config)

```bash
npm i -g vercel
vercel
```

Set the three environment variables in the **Vercel Dashboard → Settings → Environment Variables**.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build
```

Set environment variables under **Site Settings → Environment Variables**.

---

## 🔮 Roadmap

- [ ] Search & filter by name, tags, or date
- [ ] Bulk select & delete
- [ ] Image transformations (resize, crop, rotate)
- [ ] Upload progress bar
- [ ] Drag-and-drop images into folders
- [ ] Dark mode
- [ ] AI-powered auto-tagging
- [ ] Duplicate detection

---

## 🔒 Security Notes

- Cloudinary credentials are **server-side only** — never exposed to the browser
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is the only public variable (safe to expose — it's in your CDN URLs anyway)
- Never commit `.env.local` to version control (already in `.gitignore`)

---

<div align="center">

Built with ❤️ using **Next.js** & **Cloudinary**

</div>
