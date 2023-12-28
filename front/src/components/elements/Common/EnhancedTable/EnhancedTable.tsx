import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from '@mui/material';
import { EnhancedTableHead, HeadCell, Data, Order } from './EnhancedTableHead';
import { EnhancedTableToolbar } from './EnhancedTableToolbar';

interface EnhancedTableProps {
  columns: HeadCell[];
  rows: Data[];
  page: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  rowsPerPage: number;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectBlog?: (slugs: string) => void;
  handleEditBlog: (blogId: string) => void;
  handleDeleteBlog: (blogId: string) => void;
  handleChangePublishStatus: (blogId: string, isPublished: boolean) => void;
  totalResults: number;
  isDraftTable?: boolean;
}

function getComparator<Key extends keyof any>(order: Order, orderBy: Key): (a: Data, b: Data) => number {
  const stringOrNumberOrderBy = orderBy as string | number;
  const sortOrder = order === 'desc' ? -1 : 1;

  return (a, b) => {
    const valueA = a[stringOrNumberOrderBy];
    const valueB = b[stringOrNumberOrderBy];

    if (valueA instanceof Date && valueB instanceof Date) {
      // Compare dates directly for proper sorting
      return sortOrder * (valueA.getTime() - valueB.getTime());
    } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
      // Compare booleans (true > false)
      return sortOrder * (valueA === valueB ? 0 : valueA ? 1 : -1);
    }

    // Fallback to default string/number comparison
    return sortOrder * (valueA < valueB ? -1 : valueA > valueB ? 1 : 0);
  };
}

function EnhancedTable({
  columns,
  rows,
  page,
  handleChangePage,
  rowsPerPage,
  handleChangeRowsPerPage,
  handleSelectBlog,
  handleEditBlog,
  handleDeleteBlog,
  handleChangePublishStatus,
  totalResults,
  isDraftTable,
}: EnhancedTableProps) {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('title');
  const [selected, setSelected] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, index: number) => {
    setSelected(index);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = useMemo(
    () =>
      rows
        .filter((row) => String(row.name).toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .sort(getComparator(order, orderBy)),
    [order, orderBy, page, rowsPerPage, searchQuery],
  );

  React.useEffect(() => {
    if (handleSelectBlog) {
      handleSelectBlog(rows[selected].slug as string);
    }
  }, [selected]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              columns={columns}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              isDraftTable={isDraftTable}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected === index;
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    hover
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id as number}
                    selected={isDraftTable ? false : isItemSelected}
                  >
                    {!isDraftTable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                          disabled={row.isDraft as boolean}
                          onClick={(event: React.MouseEvent<unknown, MouseEvent>) => handleClick(event, row.index as number)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const cellValue = row[column.id];
                      if (column.id === 'edit' || column.id === 'delete') {
                        return null;
                      }
                      return (
                        <TableCell
                          key={column.id}
                          align={column.numeric ? 'right' : 'left'}
                          padding={column.disablePadding ? 'none' : 'normal'}
                        >
                          {cellValue instanceof Date ? (
                            new Date(cellValue).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          ) : typeof cellValue === 'boolean' ? (
                            <Button
                              variant={'contained'}
                              color={'primary'}
                              size={'small'}
                              onClick={() => handleChangePublishStatus(row.id as string, !cellValue)}
                            >
                              {isDraftTable ? 'Draft' : cellValue ? 'Published' : 'UnPublished'}
                            </Button>
                          ) : (
                            String(cellValue)
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell align="right">
                      <Button
                        variant={'contained'}
                        color={'primary'}
                        size={'small'}
                        onClick={() => handleEditBlog(row.id as string)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant={'contained'}
                        color={'primary'}
                        size={'small'}
                        onClick={() => handleDeleteBlog(row.id as string)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalResults}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

export default EnhancedTable;
