export interface Clue {
  id: number;
  text: string;
  name: string;
  cell_ids: number[];
  complete_answer: string;
}

export interface Cell {
  id: number;
  answer: string;
  clue_location_ids: number[];
}

export interface Puzzle {
  id: number;
  publication_date: string;
  clues: Clue[];
  cells: Record<number, Cell>;
} 