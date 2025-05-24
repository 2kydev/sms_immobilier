
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Profile } from '../pipeline/types';
import { useUserForm } from './useUserForm';
import UserForm from './UserForm';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  onSave: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, user, onSave }) => {
  const { formData, setFormData, loading, handleSubmit } = useUserForm(user, onSave, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
        </DialogHeader>
        
        <UserForm
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          user={user}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
