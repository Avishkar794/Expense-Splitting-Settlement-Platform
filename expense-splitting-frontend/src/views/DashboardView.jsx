import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/api';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import { LogOut, Plus, Search, User, Compass, Users } from 'lucide-react';

const DashboardView = ({ onViewGroup, onShowToast }) => {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchGroups = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await groupService.getAll();
      // Ensure data is array
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      onShowToast(err.message || 'Failed to load groups', 'danger');
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchGroups(false);
  }, [fetchGroups]);

  const filteredGroups = groups.filter(g => 
    g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.groupDescription && g.groupDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px hsla(var(--primary), 0.25)',
              fontWeight: 800
            }}>
              S
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              SplitEase
            </span>
          </div>

          {/* Profile Widget */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'hsla(var(--bg-main), 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsla(var(--border-color))'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsla(var(--primary), 0.15), hsla(var(--secondary), 0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--primary))',
              fontWeight: '700',
              fontSize: '1.1rem',
              border: '1px solid hsla(var(--primary), 0.2)'
            }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : <User size={18} />}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.username}
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                {user?.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              color: 'hsl(var(--text-main))',
              background: 'hsla(var(--primary), 0.1)',
              borderLeft: '3px solid hsl(var(--primary))',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              <Compass size={18} />
              My Groups
            </a>
          </nav>
        </div>

        {/* Logout at bottom */}
        <button 
          className="btn btn-secondary" 
          onClick={logout}
          style={{ width: '100%', justifyContent: 'flex-start', gap: '12px' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      {/* Main Workspace Area */}
      <main style={{ padding: '2.5rem', overflowY: 'auto', height: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>My Workspace</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem', marginTop: '2px' }}>
                View and manage your shared expense groups
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={18} />
              Create Group
            </button>
          </div>

          {/* Search Controls */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '450px',
            width: '100%'
          }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', color: 'hsl(var(--text-muted))' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search groups by name or description..."
              style={{ paddingLeft: '2.75rem', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
            </div>
          ) : filteredGroups.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredGroups.map(group => (
                <div key={group.groupId}>
                  <GroupCard 
                    group={group} 
                    onViewDetails={onViewGroup} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '4rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'hsla(var(--primary), 0.08)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--primary))',
                border: '1px solid hsla(var(--primary), 0.2)'
              }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {searchQuery ? 'No matching groups' : 'No groups found'}
              </h3>
              <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '400px', fontSize: '0.9rem' }}>
                {searchQuery 
                  ? `We couldn't find any groups matching "${searchQuery}". Try editing your query.` 
                  : "You are not a member of any expense splitting groups yet. Create a group or ask an admin to add you!"
                }
              </p>
              {!searchQuery && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsCreateOpen(true)}
                  style={{ marginTop: '0.5rem' }}
                >
                  <Plus size={16} /> Create Group
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal Overlay */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onGroupCreated={fetchGroups}
        onShowToast={onShowToast}
      />
    </div>
  );
};

export default DashboardView;
