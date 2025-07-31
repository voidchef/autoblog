import { Box, Button } from '@mui/material';

interface ActionButtonsProps {
  isEditMode: boolean;
  isPublished: boolean;
  disabled?: boolean;
  onReset: () => void;
  onUpdate: () => void;
  onOpenImagePicker: () => void;
  onPublishStatusChange: () => void;
}

export default function ActionButtons({
  isEditMode,
  isPublished,
  disabled = false,
  onReset,
  onUpdate,
  onOpenImagePicker,
  onPublishStatusChange,
}: ActionButtonsProps) {
  return (
    <Box
      width={{ sm: '40%' }}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      sx={{ gap: { xs: 2, sm: 3 } }}
    >
      <Button 
        type="submit" 
        variant="contained" 
        sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
        disabled={disabled}
      >
        {isEditMode ? 'Preview' : 'Generate'}
      </Button>
      <Button 
        variant="contained" 
        sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }} 
        disabled={!isEditMode || disabled} 
        onClick={onReset}
      >
        Reset
      </Button>
      <Button
        variant="contained"
        sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
        disabled={!isEditMode || disabled}
        onClick={onUpdate}
      >
        Save
      </Button>
      <Button
        variant="contained"
        sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
        disabled={!isEditMode || disabled}
        onClick={onOpenImagePicker}
      >
        Select Image
      </Button>
      <Button
        variant="contained"
        sx={{ width: { xs: '100%', sm: '15rem' }, m: 1 }}
        disabled={!isEditMode || disabled}
        onClick={onPublishStatusChange}
      >
        {isPublished ? 'UnPublish' : 'Publish'}
      </Button>
    </Box>
  );
}
