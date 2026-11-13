# School website frontend

This folder is a standalone Vite project and can be deployed as its own Vercel project/repository.

## Vercel setup

1. Create a repository containing the contents of this folder and import it into Vercel.
2. Set `VITE_API_URL` to the backend Vercel deployment origin, for example `https://your-backend.vercel.app` (no trailing slash).
3. Build with `npm run build`; Vercel uses the `dist` output directory.
4. After the first deployment, copy the frontend origin into the backend's `FRONTEND_ORIGINS` setting.

For local development, leave `VITE_API_URL` unset to use the Vite proxy to `localhost:3001`.
