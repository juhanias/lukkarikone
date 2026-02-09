import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// Get git information at build time
function getGitInfo() {
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    const commitDate = execSync("git log -1 --format=%ci").toString().trim();

    // Try to get branch name from git
    let branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

    // In Cloudflare Pages (and other CI), git is in detached HEAD state
    // thankfully cloudflare has a bailout!
    if (branch === "HEAD") {
      branch = process.env.CF_PAGES_BRANCH || "main";
    }

    return { commitHash, branch, commitDate };
  } catch {
    return {
      commitHash: "unknown",
      branch: process.env.CF_PAGES_BRANCH || "main",
      commitDate: new Date().toISOString(),
    };
  }
}

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const gitInfo = getGitInfo();

  return defineConfig({
    plugins: [react(), tailwindcss()],

    define: {
      __GIT_COMMIT_HASH__: JSON.stringify(gitInfo.commitHash),
      __GIT_BRANCH__: JSON.stringify(gitInfo.branch),
      __GIT_COMMIT_DATE__: JSON.stringify(gitInfo.commitDate),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: parseInt(process.env.VITE_PORT || "5173", 10),
    },

    base: "/",

    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          en: path.resolve(__dirname, "src/en/index.html"),
          fi: path.resolve(__dirname, "src/fi/index.html"),
        },
      },
    },
  });
};
