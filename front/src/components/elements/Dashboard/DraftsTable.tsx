import * as React from 'react';
import EnhancedTable from '../Common/EnhancedTable/EnhancedTable';
import { useAppSelector } from '../../../utils/reduxHooks';
import { useGetBlogsWithStatsQuery, useUpdateBlogMutation, useDeleteBlogMutation } from '../../../services/blogApi';
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
  
  const { data: drafts, isLoading } = useGetBlogsWithStatsQuery({ 
    limit: rowsPerPage, 
    page: page + 1, 
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
            blog.views || 0,
            blog.likes?.length || 0,
            blog.commentsCount || 0,
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
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Loading drafts...
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
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 146, 60, 0.05) 100%)',
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)'
                    : 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              📄 Draft Posts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Continue working on your unpublished content
            </Typography>
          </Box>
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
            No drafts available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All your posts are published!
          </Typography>
        </Box>
      )}
    </React.Fragment>
  );
}
