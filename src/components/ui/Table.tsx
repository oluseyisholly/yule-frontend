"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RowClassName<Row> =
  | string
  | ((row: Row, rowIndex: number) => string | undefined);

export type TableColumn<Row> = {
  id: string;
  header: React.ReactNode;
  accessor?: keyof Row | ((row: Row, rowIndex: number) => React.ReactNode);
  render?: (row: Row, rowIndex: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: RowClassName<Row>;
};

export type TableData<Row> = {
  columns: TableColumn<Row>[];
  rows: Row[];
  getRowKey?: (row: Row, rowIndex: number) => React.Key;
  headerRowClassName?: string;
  rowClassName?: RowClassName<Row>;
  headerCellClassName?: string;
  bodyCellClassName?: string;
  tbodyClassName?: string;
  emptyState?: React.ReactNode;
  emptyRowClassName?: string;
};

type TableProps<Row> = Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  "children"
> & {
  children?: React.ReactNode;
  data?: TableData<Row>;
  wrapperClassName?: string;
  tableClassName?: string;
};

function resolveRowClassName<Row>(
  value: RowClassName<Row> | undefined,
  row: Row,
  rowIndex: number,
) {
  if (typeof value === "function") {
    return value(row, rowIndex);
  }

  return value;
}

function resolveCellContent<Row>(
  column: TableColumn<Row>,
  row: Row,
  rowIndex: number,
) {
  if (column.render) {
    return column.render(row, rowIndex);
  }

  if (typeof column.accessor === "function") {
    return column.accessor(row, rowIndex);
  }

  if (column.accessor) {
    return row[column.accessor] as React.ReactNode;
  }

  return null;
}

export default function Table<Row>({
  children,
  data,
  wrapperClassName = "",
  tableClassName = "w-full",
  className,
  ...tableProps
}: TableProps<Row>) {
  if (!data) {
    return (
      <div className={wrapperClassName}>
        <table
          className={cn(tableClassName, className)}
          {...tableProps}
        >
          {children}
        </table>
      </div>
    );
  }

  const {
    columns,
    rows,
    getRowKey,
    headerRowClassName,
    rowClassName,
    headerCellClassName,
    bodyCellClassName,
    tbodyClassName,
    emptyState,
    emptyRowClassName,
  } = data;

  return (
    <div className={wrapperClassName}>
      <table
        className={cn(tableClassName, className)}
        {...tableProps}
      >
        <thead>
          <tr className={headerRowClassName}>
            {columns.map((column) => (
              <th
                key={column.id}
                className={cn(headerCellClassName, column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={tbodyClassName}>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <tr
                key={getRowKey?.(row, rowIndex) ?? rowIndex}
                className={resolveRowClassName(rowClassName, row, rowIndex)}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      bodyCellClassName,
                      resolveRowClassName(column.cellClassName, row, rowIndex),
                    )}
                  >
                    {resolveCellContent(column, row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className={emptyRowClassName}>
              <td colSpan={columns.length}>{emptyState ?? null}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
