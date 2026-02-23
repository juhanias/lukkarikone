import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SeenCommitsState {
  seenCommits: string[];
  addSeenCommit: (sha: string) => void;
  addSeenCommits: (shas: string[]) => void;
  hasSeenCommit: (sha: string) => boolean;
  clearSeenCommits: () => void;
}

export const useSeenCommitsStore = create<SeenCommitsState>()(
  persist(
    (set, get) => ({
      seenCommits: [],
      addSeenCommit: (sha: string) => {
        const { seenCommits } = get();
        if (!seenCommits.includes(sha)) {
          set({ seenCommits: [...seenCommits, sha] });
        }
      },
      addSeenCommits: (shas: string[]) => {
        const { seenCommits } = get();
        const newShas = shas.filter((sha) => !seenCommits.includes(sha));
        if (newShas.length > 0) {
          set({ seenCommits: [...seenCommits, ...newShas] });
        }
      },
      hasSeenCommit: (sha: string) => {
        return get().seenCommits.includes(sha);
      },
      clearSeenCommits: () => {
        set({ seenCommits: [] });
      },
    }),
    {
      name: "seen-commits",
      version: 1,
    },
  ),
);

export default useSeenCommitsStore;
