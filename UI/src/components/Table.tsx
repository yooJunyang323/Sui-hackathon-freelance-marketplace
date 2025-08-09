import React from 'react';
import { GlassCard } from './GlassCard';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({ 
  columns, 
  data, 
  emptyMessage = 'No data available' 
}) => {
  if (data.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-purple-300/60">{emptyMessage}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-purple-400/20">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-purple-200/90"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-purple-400/10 hover:bg-black/30 transition-colors duration-200"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-purple-200/70">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
