import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';

interface ImagePickerProps {
  open: boolean;
  handleClose: () => void;
  images: string[];
  blogImage?: string;
  handleSelectImage: (image: string) => void;
}

const ImagePicker = ({ open, handleClose, images, blogImage, handleSelectImage }: ImagePickerProps) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" sx={{ zIndex: 10000 }}>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
        <DialogTitle id="blog-image-selector">Select Cover Image</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            right: 0,
            top: 0,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6 }} onClick={() => handleSelectImage(image)}>
              <div
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 8,
                  border: blogImage === image ? '2px solid #FF0000' : '2px solid transparent',
                  backgroundColor: blogImage === image ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={image}
                  alt={`Random Image ${index + 1}`}
                  style={{
                    width: '100%',
                    borderRadius: 6,
                  }}
                />
              </div>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePicker;
