import React from 'react';
import {
  TableRow,
  Skeleton,
} from '@mui/material';
import TableRowSkeleton from './TableRowSkeleton';

interface TableSkeletonProps {
  headers: string[];
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  headers, 
  rows = 5
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowSkeleton 
          key={index} 
          columns={headers.length}
          height={40}
        />
      ))}
    </>
  );
};

export default React.memo(TableSkeleton);
