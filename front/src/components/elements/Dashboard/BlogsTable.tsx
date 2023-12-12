import * as React from 'react';
import EnhancedTable from '../Common/EnhancedTable/EnhancedTable';
import { useAppDispatch, useAppSelector } from '../../../utils/reduxHooks';
import { deleteBlog, getBlogs, updateBlog } from '../../../actions/blog';
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
    disablePadding: true,
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

interface IProps {
  handleSelectBlog: (slug: string) => void;
}

export default function BlogsTable({ handleSelectBlog }: IProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState([]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const blogs = useAppSelector((state) => state.blog.allBlogs);

  React.useEffect(() => {
    dispatch(getBlogs({ limit: rowsPerPage, page, populate: 'author', author: userId, isDraft: false }));
  }, [rowsPerPage, page]);

  React.useEffect(() => {
    if (blogs.results.length > 0) {
      setRows(
        blogs.results.map((blog: IBlog, index: number) =>
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
            blog.isPublished,
          ),
        ),
      );
    }
  }, [blogs]);

  function handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  function handleChangePublishStatus(blogId: string, isPublished: boolean) {
    dispatch(updateBlog({ isPublished }, false, blogId, () => navigate(ROUTES.DASHBOARD)));
  }

  function handleEditBlog(blogId: string) {
    navigate(ROUTES.CREATEPOST, { state: { blogId } });
  }

  function handleDeleteBlog(blogId: string) {
    dispatch(deleteBlog(blogId));
  }

  return (
    <React.Fragment>
      {rows.length > 0 && (
        <Box>
          <Typography component={'div'} fontSize={'1rem'} color={'#6D6E76'}>
            Blogs
          </Typography>
          <Box sx={{ my: 1 }} />
          <EnhancedTable
            columns={headCells}
            rows={rows}
            page={page}
            handleChangePage={handleChangePage}
            rowsPerPage={rowsPerPage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleSelectBlog={handleSelectBlog}
            handleEditBlog={handleEditBlog}
            handleDeleteBlog={handleDeleteBlog}
            handleChangePublishStatus={handleChangePublishStatus}
            totalResults={blogs.totalResults}
          />
        </Box>
      )}
    </React.Fragment>
  );
}
