import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cell, Clue } from '../types';

type CellId = number;

export interface GameState {
  // User answers for each clue, stored as Record<clueId, string[]>
  userAnswersForCells: Record<CellId, string>;
  // Current clue index
  currentClueIndex: number;
  // All clues from the puzzle
  clues: Clue[];
  cells: Record<string, Cell>
  // Loading state
  loading: boolean;
  // Speaking state
  isSpeaking: boolean;
  soundEnabled: boolean;
  
  // Actions
  setClues: (clues: Clue[]) => void;
  setCells: (cells: Record<string, Cell>) => void;
  setLoading: (loading: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  setCurrentClueIndex: (index: number) => void;
  setAnswerForCell: (cellId: number, value: string) => void;
  clearAnswers: () => void;
  toggleSound: () => void;
  
  // Computed values
  getCompletedClues: () => number;
  isClueComplete: (clueId: number) => boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      userAnswersForCells: {},
      currentClueIndex: 0,
      clues: [],
      cells: {},
      loading: true,
      isSpeaking: false,
      soundEnabled: true,
      
      setClues: (clues: Clue[]) => set({ clues }),
      setCells: (cells: Record<string, Cell>)=> set({ cells }),
      setLoading: (loading: boolean) => set({ loading }),
      setIsSpeaking: (isSpeaking: boolean) => set({ isSpeaking }),
      setCurrentClueIndex: (index: number) => set({ currentClueIndex: index }),
      setAnswerForCell: (cellId: number, value: string) => {
        set((state: GameState) => {
          return {
            userAnswersForCells: {
              ...state.userAnswersForCells,
              [cellId]: value
            }
          }
        })
      },
        
      clearAnswers: () => set({ userAnswersForCells: {} }),
      
      // Check if a clue is complete (all letters filled in)
      isClueComplete: (clueId: number) => {
        const state = get();
        const clue = state.clues.find(c => c.id === clueId);
        if (!clue) return false;
        
        return clue.cell_ids.every((cell_id: number)=>state.userAnswersForCells[cell_id] && state.userAnswersForCells[cell_id])
  
      },
      
      // Count how many clues are complete
      getCompletedClues: () => {
        const state = get();
        return state.clues.filter((clue: Clue) => state.isClueComplete(clue.id)).length;
      },
      
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'blind-crossword-storage',
      // Only persist user answers and current clue index
      partialize: (state: GameState) => ({ 
        userAnswersForCells: state.userAnswersForCells,
        currentClueIndex: state.currentClueIndex
      }),
    }
  )
); 