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
  isFeatured: boolean,
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
    isFeatured,
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
  {
    id: 'actions',
    numeric: true,
    disablePadding: false,
    label: 'Actions',
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
            blog.isFeatured,
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
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Loading blogs...
          </Typography>
        </Box>
      ) : rows.length > 0 ? (
        <Box
          sx={{
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(19, 24, 39, 0.6)'
                : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(29, 78, 216, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              📝 Published Blogs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage and track your published content
            </Typography>
          </Box>
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
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(19, 24, 39, 0.4)'
                : 'rgba(255, 255, 255, 0.7)',
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No published blogs yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start creating amazing content!
          </Typography>
        </Box>
      )}
    </React.Fragment>
  );
}
