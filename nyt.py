import json
from pydantic import BaseModel
from typing import List, NewType, TypedDict


class Clue(BaseModel):
    id: int
    text: str
    name: str
    cell_ids: list[int]
    complete_answer: str

class Cell(BaseModel):
    id: int
    answer: str
    clue_location_ids: list[int]

CellsByID = NewType('CellsByID', dict[int, Cell])

class Puzzle(BaseModel):
    id: int
    publication_date: str
    clues: list[Clue]
    cells: CellsByID

class NYTClueListItem(TypedDict):
    clues: list[int]
    name: str

class NYTCellItem(TypedDict):
    answer: str
    clues: list[int]
    label: str | None
    type: int | None


def _get_clues_from_puzzle_output(puzzle_output: dict):
    nyt_clues = puzzle_output["clues"]
    clues: list[Clue] = []
    for idx, clue in enumerate(nyt_clues):
        # There are no ids passed back via the API for clues, but
        # we can deduce them by tracking the index of the clue in the list
        id = idx
        clue_model = Clue(
            id=id,
            name=f'{clue["label"]} {clue["direction"]}',
            direction=clue['direction'],
            text=clue['text'][0]['plain'],
            cell_ids=clue['cells'],
            complete_answer=""
        )
        clues.append(clue_model)
    return clues

def _get_cells_from_puzzle_output(puzzle_output: dict) -> CellsByID:
    # There are no ids passed back via the API for cell, but
    # we can deduce them by tracking the index of the cell in the list
    nyt_cells: list[NYTCellItem] = puzzle_output["cells"] 
    cells: CellsByID = {}

    # In this list, we can occationally be passed back {} as an indicator
    # of a black square in the cell
    for idx, cell in enumerate(nyt_cells):
        if cell == {}:
            continue

        cell_model = Cell(
            id=idx,
            clue_location_ids=cell['clues'],
            answer=cell['answer']
        )
        cells[idx] = cell_model
    return cells

def _populate_answers_for_clues(clues: list[Clue], cells: CellsByID):
    enriched_clues: list[Clue] = []
    for clue in clues:
        answer = ""
        for cell_id in clue.cell_ids:
            cell = cells.get(cell_id)
            if cell:
                answer += cell.answer
            else:
                answer += "_"
        clue.complete_answer = answer
        enriched_clues.append(clue)
    return enriched_clues



def process_nytimes_puzzle(puzzle_output: dict):
    body = puzzle_output["body"][0]

    clues = _get_clues_from_puzzle_output(body)
    cells = _get_cells_from_puzzle_output(body)

    enriched_clues = _populate_answers_for_clues(clues, cells)

    puzzle = Puzzle(id=puzzle_output["id"], publication_date=puzzle_output["publicationDate"], clues=enriched_clues, cells=cells)

    with open("puzzle.json", "w") as f:
       json.dump(puzzle.model_dump(), f, indent=2)




if __name__ == "__main__":
    with open("sample/puzzle.json", "r") as f:
        puzzle_output = json.load(f)
    process_nytimes_puzzle(puzzle_output)
