import React from 'react';
import {
  TableRow,
  TableCell,
  Skeleton,
} from '@mui/material';

interface TableRowSkeletonProps {
  columns: number;
  height?: number;
}

const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({ 
  columns, 
  height = 32 
}) => {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton 
            variant="text" 
            width="80%" 
            height={height}
            sx={{ borderRadius: 1 }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
};

export default React.memo(TableRowSkeleton);
