import React, { useState } from 'react';
import Modal from './Modal';
import { groupService } from '../services/api';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated, onShowToast }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Group name is required', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await groupService.create(name, description);
      onShowToast('Group created successfully', 'success');
      setName('');
      setDescription('');
      onGroupCreated();
      onClose();
    } catch (err) {
      onShowToast(err.message || 'Failed to create group', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="group-name">Group Name</label>
          <input
            id="group-name"
            type="text"
            className="input-field"
            placeholder="e.g. Europe Trip 2026, Roommates"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="group-desc">Description (Optional)</label>
          <textarea
            id="group-desc"
            className="input-field"
            rows="3"
            placeholder="What is this group for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', paddingRight: 0, paddingBottom: 0 }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? <div className="spinner"></div> : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
