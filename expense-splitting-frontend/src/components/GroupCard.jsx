import React from 'react';
import { Users, Shield, ArrowRight } from 'lucide-react';

const GroupCard = ({ group, onViewDetails }) => {
  const isAdmin = group.role === 'ADMIN';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, hsla(var(--primary), 0.15), hsla(var(--secondary), 0.15))',
            borderRadius: 'var(--radius-sm)',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--primary))',
            border: '1px solid hsla(var(--primary), 0.25)'
          }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'hsl(var(--text-main))' }}>{group.groupName}</h3>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              {isAdmin ? (
                <>
                  <Shield size={12} className="text-primary" /> Admin View
                </>
              ) : (
                'Member View'
              )}
            </span>
          </div>
        </div>
        <span className={`badge ${isAdmin ? 'badge-success' : 'badge-gray'}`}>
          {group.role}
        </span>
      </div>

      <p style={{
        fontSize: '0.9rem',
        color: 'hsl(var(--text-muted))',
        flexGrow: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '2.7em'
      }}>
        {group.groupDescription || 'No description provided.'}
      </p>

      <button 
        className="btn btn-secondary" 
        onClick={() => onViewDetails(group.groupId)}
        style={{ width: '100%', justifyContent: 'space-between', marginTop: 'auto' }}
      >
        Open Workspace
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default GroupCard;
