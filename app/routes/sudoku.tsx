import { useState } from "react";
import type { Route } from "./+types/sudoku";

type CellValue = number | null;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sudoku" },
    { name: "description", content: "Sudoku puzzle helper" },
  ];
}

function createEmptyGrid(): CellValue[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function getBlockIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

export default function Sudoku() {
  const [grid, setGrid] = useState<CellValue[][]>(createEmptyGrid);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const highlightedRows = new Set<number>();
  const highlightedCols = new Set<number>();
  const highlightedBlocks = new Set<number>();

  if (selectedNumber !== null) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === selectedNumber) {
          highlightedRows.add(r);
          highlightedCols.add(c);
          highlightedBlocks.add(getBlockIndex(r, c));
        }
      }
    }
  }

  const updateCell = (row: number, col: number, value: CellValue) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Sudoku</h1>

      <div className="inline-grid grid-cols-9 border-2 border-gray-800 dark:border-gray-200">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isHighlighted =
              highlightedRows.has(r) ||
              highlightedCols.has(c) ||
              highlightedBlocks.has(getBlockIndex(r, c));

            const borderRight =
              c === 2 || c === 5
                ? "border-r-2 border-r-gray-800 dark:border-r-gray-200"
                : "border-r border-r-gray-400 dark:border-r-gray-600";
            const borderBottom =
              r === 2 || r === 5
                ? "border-b-2 border-b-gray-800 dark:border-b-gray-200"
                : "border-b border-b-gray-400 dark:border-b-gray-600";

            return (
              <input
                key={`${r}-${c}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={cell ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    updateCell(r, c, null);
                  } else if (/^[1-9]$/.test(val)) {
                    updateCell(r, c, parseInt(val, 10));
                  }
                }}
                className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-medium outline-none
                  ${borderRight} ${borderBottom}
                  ${isHighlighted ? "bg-yellow-200 dark:bg-yellow-800" : "bg-white dark:bg-gray-900"}
                  focus:bg-blue-100 dark:focus:bg-blue-900`}
              />
            );
          })
        )}
      </div>

      <div className="flex gap-2 mt-6">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() =>
              setSelectedNumber(selectedNumber === num ? null : num)
            }
            className={`w-10 h-10 sm:w-12 sm:h-12 text-lg font-medium rounded-lg border transition-colors
              ${
                selectedNumber === num
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
