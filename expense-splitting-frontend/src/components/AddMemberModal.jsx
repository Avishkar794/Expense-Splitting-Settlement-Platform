import React, { useState } from 'react';
import Modal from './Modal';
import { Search, UserPlus, X, Check } from 'lucide-react';
import { userService, groupService } from '../services/api';

const AddMemberModal = ({ isOpen, onClose, groupId, existingMembers, onMemberAdded, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Clear state when modal closes
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    onClose();
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await userService.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      onShowToast(err.message || 'Failed to search users', 'danger');
    } finally {
      setSearching(false);
    }
  };

  const toggleSelectUser = (user) => {
    if (selectedUsers.some(u => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter(u => u.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setSubmitting(true);
    try {
      const ids = selectedUsers.map(u => u.userId);
      await groupService.addMembers(groupId, ids);
      onShowToast(`Successfully added ${selectedUsers.length} member(s)`, 'success');
      onMemberAdded();
      handleClose();
    } catch (err) {
      onShowToast(err.message || 'Failed to add members', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Group Members">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Search form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="input-group" style={{ flexGrow: 1, marginBottom: 0 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searching || submitting}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-secondary" 
            disabled={searching || submitting || !searchQuery.trim()}
            style={{ padding: '0.75rem' }}
          >
            {searching ? <div className="spinner" style={{ width: '16px', height: '16px' }}></div> : <Search size={18} />}
          </button>
        </form>

        {/* Selected Users Chips */}
        {selectedUsers.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', background: 'hsla(var(--bg-main), 0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid hsla(var(--border-color))' }}>
            {selectedUsers.map(user => (
              <span 
                key={user.userId} 
                className="badge badge-success"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'none', padding: '0.35rem 0.65rem' }}
              >
                {user.username}
                <X 
                  size={12} 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => toggleSelectUser(user)}
                />
              </span>
            ))}
          </div>
        )}

        {/* Results List */}
        <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {searchResults.length > 0 ? (
            searchResults.map(user => {
              const isAlreadyMember = existingMembers && existingMembers.some(m => m.userId === user.userId);
              const isSelected = selectedUsers.some(u => u.userId === user.userId);

              return (
                <div 
                  key={user.userId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    background: isSelected ? 'hsla(var(--primary), 0.08)' : 'hsla(var(--bg-main), 0.2)',
                    border: '1px solid ' + (isSelected ? 'hsl(var(--primary))' : 'hsla(var(--border-color))'),
                    borderRadius: 'var(--radius-sm)',
                    opacity: isAlreadyMember ? 0.6 : 1
                  }}
                >
                  <div>
                    <strong style={{ color: 'hsl(var(--text-main))' }}>{user.username}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block' }}>{user.email}</span>
                  </div>

                  {isAlreadyMember ? (
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Member</span>
                  ) : (
                    <button
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleSelectUser(user)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      type="button"
                    >
                      {isSelected ? <Check size={14} /> : <UserPlus size={14} />}
                    </button>
                  )}
                </div>
              );
            })
          ) : searchQuery && !searching ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'hsl(var(--text-muted))' }}>
              No users found matching "{searchQuery}"
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>
              Search for users to add them to this group.
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', paddingRight: 0, paddingBottom: 0 }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={submitting}
          >
            Close
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleAddMembers}
            disabled={submitting || selectedUsers.length === 0}
          >
            {submitting ? <div className="spinner"></div> : `Add Selected (${selectedUsers.length})`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
