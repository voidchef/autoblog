import * as React from 'react';
import EnhancedTable from '../Common/EnhancedTable/EnhancedTable';
import { useAppSelector, useAppDispatch } from '../../../utils/reduxHooks';
import { 
  useGetBlogsQuery, 
  useUpdateBlogMutation, 
  useDeleteBlogMutation,
  usePublishToWordPressMutation,
  usePublishToMediumMutation 
} from '../../../services/blogApi';
import { IBlog } from '../../../reducers/blog';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routing/routes';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useAuth } from '../../../utils/hooks';
import { showError, showSuccess } from '../../../reducers/alert';

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
  wordpressStatus?: string,
  mediumStatus?: string,
  wordpressUrl?: string,
  mediumUrl?: string,
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
    wordpressStatus,
    mediumStatus,
    wordpressUrl,
    mediumUrl,
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
    id: 'wordpress',
    numeric: true,
    disablePadding: false,
    label: 'WordPress',
  },
  {
    id: 'medium',
    numeric: true,
    disablePadding: false,
    label: 'Medium',
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
  const [rows, setRows] = React.useState<ReturnType<typeof createData>[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const userId = localStorage.getItem('userId');
  
  const { data: blogs, isLoading } = useGetBlogsQuery({ 
    limit: rowsPerPage, 
    page: page + 1, 
    author: userId || '', 
    isDraft: false 
  });
  
  const [updateBlog] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [publishToWordPress, { isLoading: isPublishingWP }] = usePublishToWordPressMutation();
  const [publishToMedium, { isLoading: isPublishingMedium }] = usePublishToMediumMutation();

  React.useEffect(() => {
    if (blogs && blogs.results.length > 0) {
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
            blog.wordpressPublishStatus,
            blog.mediumPublishStatus,
            blog.wordpressPostUrl,
            blog.mediumPostUrl,
          ),
        ),
      );
    } else {
      setRows([]);
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
    updateBlog({ id: blogId, data: { isPublished } });
  }

  function handleEditBlog(blogId: string) {
    navigate(ROUTES.CREATEPOST, { state: { blogId } });
  }

  function handleDeleteBlog(blogId: string) {
    deleteBlog(blogId);
  }

  async function handlePublishToWordPress(blogId: string) {
    // Check if WordPress is configured
    if (!user?.hasWordPressConfig) {
      dispatch(showError('WordPress is not configured. Please update your WordPress settings in your profile.'));
      return;
    }

    try {
      const result = await publishToWordPress({ blogId }).unwrap();
      dispatch(showSuccess('Successfully published to WordPress!'));
    } catch (error: any) {
      dispatch(showError(error?.data?.message || 'Failed to publish to WordPress'));
    }
  }

  async function handlePublishToMedium(blogId: string) {
    // Check if Medium is configured
    if (!user?.hasMediumConfig) {
      dispatch(showError('Medium is not configured. Please update your Medium settings in your profile.'));
      return;
    }

    try {
      const result = await publishToMedium({ blogId }).unwrap();
      dispatch(showSuccess('Successfully published to Medium!'));
    } catch (error: any) {
      dispatch(showError(error?.data?.message || 'Failed to publish to Medium'));
    }
  }

  return (
    <React.Fragment>
      {isLoading ? (
        <Box>
          <Typography component={'div'} fontSize={'1rem'} color={'#6D6E76'}>
            Loading blogs...
          </Typography>
        </Box>
      ) : rows.length > 0 ? (
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
            handlePublishToWordPress={handlePublishToWordPress}
            handlePublishToMedium={handlePublishToMedium}
            totalResults={blogs?.totalResults || 0}
            isPublishingWP={isPublishingWP}
            isPublishingMedium={isPublishingMedium}
          />
        </Box>
      ) : (
        <Box>
          <Typography component={'div'} fontSize={'1rem'} color={'#6D6E76'}>
            No blogs found
          </Typography>
        </Box>
      )}
    </React.Fragment>
  );
}
