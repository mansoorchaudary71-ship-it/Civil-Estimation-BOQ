import React, { memo, useCallback } from 'react';
import { Plus } from 'lucide-react';

export interface ListInputProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (
    item: T,
    index: number,
    updateItem: (index: number, updates: Partial<T>) => void,
    removeItem: (index: number) => void
  ) => React.ReactNode;
  onAdd: () => void;
  addLabel?: string;
  emptyMessage?: string;
}

export function ListInput<T>({
  items,
  onChange,
  renderItem,
  onAdd,
  addLabel = "Add Item",
  emptyMessage = "No items added."
}: ListInputProps<T>) {

  const updateItem = useCallback((index: number, updates: Partial<T>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }, [items, onChange]);

  const removeItem = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  return (
    <div className="space-y-4">
      {items.map((item, index) => renderItem(item, index, updateItem, removeItem))}

      {items.length === 0 && (
        <div className="text-center py-12 bg-transparent border-2 border-dashed border-gray-200 rounded-[2rem]">
          <p className="text-base font-normal text-slate-600 leading-relaxed">
            {emptyMessage}
          </p>
        </div>
      )}

      <div className="pt-2 flex justify-center border-t border-slate-100 mt-4">
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-6 py-3 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 text-base font-semibold hover:-translate-y-0.5 min-h-[44px] min-w-[44px]"
        >
          <Plus className="w-5 h-5" /> {addLabel}
        </button>
      </div>
    </div>
  );
}
