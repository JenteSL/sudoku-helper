import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/sudoku";

type CellValue = number | null;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sudoku helper" },
    { name: "description", content: "But you still do the work." },
  ];
}

function createEmptyGrid(): CellValue[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function getBlockIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function encodeGrid(grid: CellValue[][]): string {
  return grid
    .flat()
    .map((cell) => (cell === null ? "0" : cell.toString()))
    .join("");
}

function decodeGrid(encoded: string): CellValue[][] | null {
  if (encoded.length !== 81 || !/^[0-9]+$/.test(encoded)) return null;
  const values = encoded.split("").map((c) => {
    const n = parseInt(c, 10);
    return n === 0 ? null : n;
  });
  return Array.from({ length: 9 }, (_, r) => values.slice(r * 9, (r + 1) * 9));
}

function getInitialState(searchParams: URLSearchParams) {
  const gridParam = searchParams.get("grid");
  const numParam = searchParams.get("num");
  const grid = gridParam
    ? (decodeGrid(gridParam) ?? createEmptyGrid())
    : createEmptyGrid();
  const num =
    numParam && /^[1-9]$/.test(numParam) ? parseInt(numParam, 10) : null;
  return { grid, num };
}

export default function Sudoku() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = getInitialState(searchParams);
  const [grid, setGrid] = useState<CellValue[][]>(() => initial.grid);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(
    () => initial.num,
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("grid", encodeGrid(grid));
    if (selectedNumber !== null) {
      params.set("num", selectedNumber.toString());
    }
    setSearchParams(params, { replace: true });
  }, [grid, selectedNumber, setSearchParams]);

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

  const resetGrid = () => {
    if (window.confirm("Reset the entire grid?")) {
      setGrid(createEmptyGrid());
      setSelectedNumber(null);
    }
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
          }),
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
        <button
          onClick={resetGrid}
          className="w-10 h-10 sm:w-12 sm:h-12 text-lg font-medium rounded-lg border transition-colors
            bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border-gray-400 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mx-auto"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
