# OpenUSD Garage

A beginner-friendly learning site based on the ZAZ-965 Omniverse mini demo.

## Run locally with Vercel's Next.js build

```powershell
npm install
npm run dev:vercel
```

Then open `http://localhost:3000`.

## Deploy with Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project**.
3. Import the `minidemousd` repository.
4. Keep the detected framework as **Next.js**.
5. Keep the repository root as `./`.
6. Click **Deploy**.

`vercel.json` already configures the reproducible install and Vercel build commands. The site currently requires no environment variables.

## Build targets

- `npm run build:vercel` creates the native Next.js build used by Vercel.
- `npm run build` preserves the existing Vinext/Sites build.
