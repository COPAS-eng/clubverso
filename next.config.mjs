/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const nextConfig = {
  ...(isGithubPages ? { output: "export", distDir: "out" } : {}),
  images: { unoptimized: true },
  ...(isGithubPages ? { trailingSlash: true } : {}),
  // Para GitHub Pages em https://<user>.github.io/<repo>/ — ativa basePath automaticamente
  ...(isGithubPages && repo && repo !== `${process.env.GITHUB_ACTOR}.github.io` ? { basePath: `/${repo}`, assetPrefix: `/${repo}/` } : {}),
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  async headers() {
    if (process.env.GITHUB_PAGES === "true") return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
