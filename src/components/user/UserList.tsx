
import React from 'react';
import { UserRole } from '@/hooks/useRole';
import UserCard from './UserCard';

interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface UserListProps {
  users: UserProfile[];
  onRoleUpdate: (userId: string, newRole: UserRole) => void;
  onStatusToggle: (userId: string, isActive: boolean) => void;
}

const UserList = ({ users, onRoleUpdate, onStatusToggle }: UserListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onRoleUpdate={onRoleUpdate}
          onStatusToggle={onStatusToggle}
        />
      ))}
    </div>
  );
};

export default UserList;
