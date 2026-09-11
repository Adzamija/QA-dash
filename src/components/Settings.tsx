import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user, users, addUser, updateUser, deleteUser, logout } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    
    addUser(newUsername, newPassword, newRole);
    setNewUsername('');
    setNewPassword('');
    setNewRole('user');
    setShowAddUser(false);
  };

  const handleUpdatePassword = (userId: string) => {
    if (!editPassword) return;
    updateUser(userId, { password: editPassword });
    setEditPassword('');
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert('Cannot delete your own account');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          User management and account settings
        </p>
      </div>

      {/* Current User Info */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-3">Your Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-lg font-bold text-accent">
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-text">{user?.username}</p>
            <p className="text-xs text-text-muted capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Users Management */}
      {user?.role === 'admin' && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text">User Management</h2>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors"
            >
              {showAddUser ? 'Cancel' : '+ Add User'}
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <form onSubmit={handleAddUser} className="mb-4 p-4 bg-surface-2 border border-border rounded-lg space-y-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add User
              </button>
            </form>
          )}

          {/* Users List */}
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 bg-surface-2 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{u.username}</p>
                    <p className="text-xs text-text-muted capitalize">{u.role}</p>
                  </div>
                  {u.id === user?.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingUser === u.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="px-2 py-1 bg-bg border border-border rounded text-xs text-text focus:outline-none focus:border-accent"
                        placeholder="New password"
                      />
                      <button
                        onClick={() => handleUpdatePassword(u.id)}
                        className="px-2 py-1 bg-success/20 text-success text-xs rounded hover:bg-success/30 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(null);
                          setEditPassword('');
                        }}
                        className="px-2 py-1 bg-surface border border-border text-text-muted text-xs rounded hover:bg-surface-2 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingUser(u.id)}
                        className="px-2 py-1 bg-surface border border-border text-text-muted text-xs rounded hover:bg-surface-2 hover:text-text transition-colors"
                      >
                        Change Password
                      </button>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-2 py-1 bg-danger/20 text-danger text-xs rounded hover:bg-danger/30 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text mb-3">Data Management</h2>
        <p className="text-xs text-text-muted mb-4">
          All data is stored locally in your browser. Clear data to reset everything.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Are you sure? This will delete all test history and settings.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-danger/20 text-danger text-xs font-medium rounded-lg hover:bg-danger/30 transition-colors"
          >
            Clear All Data
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            className="px-4 py-2 bg-surface-2 border border-border text-text text-xs font-medium rounded-lg hover:bg-surface transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
