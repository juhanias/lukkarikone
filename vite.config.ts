import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { execSync } from 'child_process'

// Get git information at build time
function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    const commitDate = execSync('git log -1 --format=%ci').toString().trim()
    return { commitHash, branch, commitDate }
  } catch {
    return { 
      commitHash: 'unknown', 
      branch: 'unknown', 
      commitDate: new Date().toISOString() 
    }
  }
}

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const gitInfo = getGitInfo()

  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
    ],

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
      port: parseInt(process.env.VITE_PORT || '5173', 10),
    },

    base: '/'
  });
}