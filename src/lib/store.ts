import { create } from 'zustand';

interface LookbookState {
  introComplete: boolean;
  currentFrame: number;
  scrollProgress: number;
  audioEnabled: boolean;
  magnifyMode: boolean;
  setIntroComplete: (v: boolean) => void;
  setCurrentFrame: (n: number) => void;
  setScrollProgress: (n: number) => void;
  toggleAudio: () => void;
  toggleMagnify: () => void;
}

export const useLookbookStore = create<LookbookState>((set) => ({
  introComplete: false,
  currentFrame: 0,
  scrollProgress: 0,
  audioEnabled: false,
  magnifyMode: false,
  setIntroComplete: (v) => set({ introComplete: v }),
  setCurrentFrame: (n) => set({ currentFrame: n }),
  setScrollProgress: (n) => set({ scrollProgress: n }),
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
  toggleMagnify: () => set((s) => ({ magnifyMode: !s.magnifyMode })),
}));
