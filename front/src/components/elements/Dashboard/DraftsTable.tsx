import * as React from 'react';
import EnhancedTable from '../Common/EnhancedTable/EnhancedTable';
import { useAppSelector } from '../../../utils/reduxHooks';
import { useGetBlogsQuery, useUpdateBlogMutation, useDeleteBlogMutation } from '../../../services/blogApi';
import { IBlog } from '../../../reducers/blog';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function createData(
  index: number,
  id: string,
  name: string,
  slug: string,
  views: number,
  likes: number,
  reviews: number,
  createdAt: Date,
  updatedAt: Date,
  status: boolean,
) {
  return {
    index,
    id,
    name,
    slug,
    views,
    createdAt,
    updatedAt,
    status,
    reviews,
    likes,
  };
}

const headCells = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'views',
    numeric: true,
    disablePadding: false,
    label: 'Views',
  },
  {
    id: 'likes',
    numeric: true,
    disablePadding: false,
    label: 'Likes',
  },
  {
    id: 'reviews',
    numeric: true,
    disablePadding: false,
    label: 'Reviews',
  },
  {
    id: 'createdAt',
    numeric: true,
    disablePadding: false,
    label: 'Created At',
  },
  {
    id: 'updatedAt',
    numeric: true,
    disablePadding: false,
    label: 'Updated At',
  },
  {
    id: 'status',
    numeric: true,
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'edit',
    numeric: true,
    disablePadding: false,
    label: 'Edit',
  },
  {
    id: 'delete',
    numeric: true,
    disablePadding: false,
    label: 'Delete',
  },
];

export default function DraftsTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<any[]>([]);

  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  
  const { data: drafts, isLoading } = useGetBlogsQuery({ 
    limit: rowsPerPage, 
    page: page + 1, 
    author: userId || '', 
    isDraft: true 
  });
  
  const [updateBlog] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  React.useEffect(() => {
    if (drafts && drafts.results.length > 0) {
      setRows(
        drafts.results.map((blog: IBlog, index: number) =>
          createData(
            index,
            blog.id,
            blog.title,
            blog.slug,
            69,
            69,
            69,
            new Date(blog.createdAt),
            new Date(blog.createdAt),
            blog.isDraft,
          ),
        ),
      );
    } else {
      setRows([]);
    }
  }, [drafts]);

  function handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  function handleChangePublishStatus(blogId: string, isDraft: boolean) {
    updateBlog({ id: blogId, data: { isDraft, isPublished: !isDraft } });
  }

  function handleEditBlog(blogId: string) {
    navigate(ROUTES.CREATEPOST, { state: { blogId } });
  }

  function handleDeleteBlog(blogId: string) {
    deleteBlog(blogId);
  }

  return (
    <React.Fragment>
      {isLoading ? (
        <Box>
          <Typography component={'div'} fontSize={'1rem'} color={'#6D6E76'}>
            Loading drafts...
          </Typography>
        </Box>
      ) : rows.length > 0 ? (
        <Box>
          <Typography component={'div'} fontSize={'1rem'} color={'#6D6E76'}>
            Drafts
          </Typography>
          <Box sx={{ my: 1 }} />
          <EnhancedTable
            columns={headCells}
            rows={rows}
            page={page}
            handleChangePage={handleChangePage}
            rowsPerPage={rowsPerPage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleEditBlog={handleEditBlog}
            handleDeleteBlog={handleDeleteBlog}
            handleChangePublishStatus={handleChangePublishStatus}
            totalResults={drafts?.totalResults || 0}
            isDraftTable={true}
          />
        </Box>
      ) : (
        <Box>
          <Typography component={'div'} fontSize={'1rem'} color={'#6D6E76'}>
            No drafts found
          </Typography>
        </Box>
      )}
    </React.Fragment>
  );
}
