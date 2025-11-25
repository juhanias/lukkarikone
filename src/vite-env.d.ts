/// <reference types="vite/client" />

// Git build-time constants injected by vite.config.ts
declare const __GIT_COMMIT_HASH__: string
declare const __GIT_BRANCH__: string
declare const __GIT_COMMIT_DATE__: string

declare module "*.svg" {
  const content: string;
  export default content;
}
