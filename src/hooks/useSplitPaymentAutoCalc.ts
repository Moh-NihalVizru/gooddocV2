import { useState, useCallback, useMemo } from 'react';

export interface SplitRow {
  id: string;
  method: 'cash' | 'card' | 'upi';
  amount: number; // in rupees
  isUserEdited: boolean;
}

interface UseSplitPaymentAutoCalcOptions {
  totalDue: number; // in rupees
  initialRows?: SplitRow[];
}

interface UseSplitPaymentAutoCalcReturn {
  rows: SplitRow[];
  setRows: React.Dispatch<React.SetStateAction<SplitRow[]>>;
  totalEntered: number;
  isValid: boolean;
  validationError: string | null;
  updateRowAmount: (rowId: string, newAmount: number) => void;
  updateRowMethod: (rowId: string, method: SplitRow['method']) => void;
  addRow: () => void;
  removeRow: (rowId: string) => void;
  resetDistribution: () => void;
  getCardUpiSteps: () => { id: string; method: 'card' | 'upi'; amount: number }[];
  getAllSteps: () => { id: string; method: 'cash' | 'card' | 'upi'; amount: number }[];
  hasMixedPayment: () => boolean;
}

let rowIdCounter = 0;
const generateRowId = () => `split_${++rowIdCounter}_${Date.now()}`;

export function useSplitPaymentAutoCalc({
  totalDue,
  initialRows,
}: UseSplitPaymentAutoCalcOptions): UseSplitPaymentAutoCalcReturn {
  const [rows, setRows] = useState<SplitRow[]>(() => {
    if (initialRows && initialRows.length > 0) {
      return initialRows;
    }
    // Default: single Cash row with full amount
    return [
      { id: generateRowId(), method: 'cash', amount: totalDue, isUserEdited: false },
    ];
  });

  const totalEntered = useMemo(() => 
    rows.reduce((sum, row) => sum + row.amount, 0), 
    [rows]
  );

  const isValid = useMemo(() => {
    if (rows.length === 0) return false;
    if (rows.some(r => r.amount < 0)) return false;
    // For split payment, total must equal totalDue
    return Math.abs(totalEntered - totalDue) < 0.01;
  }, [rows, totalEntered, totalDue]);

  const validationError = useMemo(() => {
    if (rows.some(r => r.amount < 0)) {
      return 'Amounts cannot be negative';
    }
    if (Math.abs(totalEntered - totalDue) >= 0.01) {
      const diff = totalDue - totalEntered;
      if (diff > 0) {
        return `₹${diff.toFixed(2)} remaining to allocate`;
      } else {
        return `₹${Math.abs(diff).toFixed(2)} over the total`;
      }
    }
    return null;
  }, [rows, totalEntered, totalDue]);

  const updateRowAmount = useCallback((rowId: string, newAmount: number) => {
    // Clamp to non-negative and max = totalDue
    const clampedAmount = Math.max(0, Math.min(newAmount, totalDue));
    
    setRows(prevRows => {
      const rowIndex = prevRows.findIndex(r => r.id === rowId);
      if (rowIndex === -1) return prevRows;

      const newRows = [...prevRows];
      newRows[rowIndex] = { ...newRows[rowIndex], amount: clampedAmount, isUserEdited: true };

      // Auto-calculate remaining for other rows
      if (newRows.length === 2) {
        // Simple case: 2 rows - update the other automatically
        const otherIndex = rowIndex === 0 ? 1 : 0;
        const remainder = Math.max(0, totalDue - clampedAmount);
        newRows[otherIndex] = { ...newRows[otherIndex], amount: remainder, isUserEdited: false };
      } else if (newRows.length > 2) {
        // Complex case: distribute remainder across non-user-edited rows
        const userEditedTotal = newRows
          .filter(r => r.isUserEdited)
          .reduce((sum, r) => sum + r.amount, 0);
        const remainder = Math.max(0, totalDue - userEditedTotal);
        const nonEditedRows = newRows.filter(r => !r.isUserEdited);
        
        if (nonEditedRows.length > 0) {
          const perRow = remainder / nonEditedRows.length;
          newRows.forEach((row, idx) => {
            if (!row.isUserEdited) {
              newRows[idx] = { ...row, amount: perRow };
            }
          });
        }
      }

      return newRows;
    });
  }, [totalDue]);

  const updateRowMethod = useCallback((rowId: string, method: SplitRow['method']) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === rowId ? { ...row, method } : row
      )
    );
  }, []);

  const addRow = useCallback(() => {
    setRows(prevRows => [
      ...prevRows,
      { id: generateRowId(), method: 'cash', amount: 0, isUserEdited: false }
    ]);
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setRows(prevRows => {
      if (prevRows.length <= 1) return prevRows;
      
      const newRows = prevRows.filter(r => r.id !== rowId);
      
      // Redistribute if needed
      const currentTotal = newRows.reduce((sum, r) => sum + r.amount, 0);
      if (currentTotal !== totalDue && newRows.length > 0) {
        const diff = totalDue - currentTotal;
        // Add diff to the first non-user-edited row, or last row if all edited
        const targetIdx = newRows.findIndex(r => !r.isUserEdited);
        const idx = targetIdx >= 0 ? targetIdx : newRows.length - 1;
        newRows[idx] = { ...newRows[idx], amount: newRows[idx].amount + diff };
      }
      
      return newRows;
    });
  }, [totalDue]);

  const resetDistribution = useCallback(() => {
    // Evenly distribute across all rows
    const perRow = totalDue / Math.max(1, rows.length);
    setRows(prevRows => 
      prevRows.map(row => ({ ...row, amount: perRow, isUserEdited: false }))
    );
  }, [totalDue, rows.length]);

  const getCardUpiSteps = useCallback(() => {
    // Filter only Card and UPI rows with amount > 0, ordered as they appear
    return rows
      .filter(row => (row.method === 'card' || row.method === 'upi') && row.amount > 0)
      .map(row => ({
        id: row.id,
        method: row.method as 'card' | 'upi',
        amount: Math.round(row.amount * 100), // Convert to paise
      }));
  }, [rows]);

  const getAllSteps = useCallback(() => {
    // Return all rows with amount > 0, in order
    return rows
      .filter(row => row.amount > 0)
      .map(row => ({
        id: row.id,
        method: row.method,
        amount: Math.round(row.amount * 100), // Convert to paise
      }));
  }, [rows]);

  const hasMixedPayment = useCallback(() => {
    // Check if there's a mix of Cash with Card/UPI (needs wizard)
    const methodsWithAmount = rows.filter(row => row.amount > 0).map(r => r.method);
    const hasCash = methodsWithAmount.includes('cash');
    const hasCardOrUpi = methodsWithAmount.includes('card') || methodsWithAmount.includes('upi');
    return hasCash && hasCardOrUpi;
  }, [rows]);

  return {
    rows,
    setRows,
    totalEntered,
    isValid,
    validationError,
    updateRowAmount,
    updateRowMethod,
    addRow,
    removeRow,
    resetDistribution,
    getCardUpiSteps,
    getAllSteps,
    hasMixedPayment,
  };
}
