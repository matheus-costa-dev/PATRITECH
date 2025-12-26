'use client';

import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

export type ResultTableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  title?: React.ReactNode;
  noDataComponent?: React.ReactNode;
  progressComponent?: React.ReactNode;
  dense?: boolean;
  pagination?: boolean;
  fixedHeader?: boolean;
  defaultSortFieldId?: number | string;
  className?: string;
};

export default function ResultTable<T>({
  data,
  columns,
  loading = false,
  title,
  noDataComponent = 'Nenhum resultado encontrado.',
  progressComponent = 'Carregando dados...',
  dense = false,
  pagination = true,
  fixedHeader = true,
  defaultSortFieldId,
  className,
}: ResultTableProps<T>) {
  return (
    <div className={className}>
      <DataTable
        title={title}
        columns={columns}
        data={data ?? []}
        progressPending={loading}
        progressComponent={
          <div className="p-3 text-sm text-slate-600">{progressComponent}</div>
        }
        noDataComponent={
          <div className="p-3 text-sm text-slate-600">{noDataComponent}</div>
        }
        dense={dense}
        pagination={pagination}
        fixedHeader={fixedHeader}
        highlightOnHover
        responsive
        persistTableHead
        defaultSortFieldId={defaultSortFieldId}
        theme='dark'
      />
    </div>
  );
}
