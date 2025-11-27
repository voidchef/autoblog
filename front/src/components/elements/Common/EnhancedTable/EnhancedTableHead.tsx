import { MouseEvent } from 'react';
import { TableHead, TableRow, TableCell, Box } from '@mui/material';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from '@mui/utils';

export interface Data {
  [key: string]: string | number | Date | boolean | undefined;
}

export interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

export type Order = 'asc' | 'desc';

interface EnhancedTableHeadProps {
  columns: HeadCell[];
  order: Order;
  orderBy: string;
  onRequestSort: (event: MouseEvent<unknown>, property: string) => void;
  isDraftTable?: boolean;
}

export function EnhancedTableHead({ columns, order, orderBy, onRequestSort, isDraftTable }: EnhancedTableHeadProps) {
  const createSortHandler = (property: string) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {!isDraftTable && <TableCell padding="normal">Select</TableCell>}
        {columns.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(String(headCell.id))}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
