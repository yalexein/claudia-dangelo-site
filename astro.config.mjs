import { defineConfig } from "astro/config";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

// For GitHub Pages project sites, the base path is "/<repo>".
// Locally (and in other hosts) it stays empty.
// If you use a custom domain, keep it empty.
const base = process.env.ASTRO_BASE ?? (isGithubActions && repo ? `/${repo}` : "");

export default defineConfig({
  base,
});
