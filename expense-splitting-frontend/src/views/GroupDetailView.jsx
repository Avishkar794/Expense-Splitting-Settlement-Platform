import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService, expenseService, balanceService, settlementService } from '../services/api';
import ExpenseCard from '../components/ExpenseCard';
import BalanceBoard from '../components/BalanceBoard';
import AddMemberModal from '../components/AddMemberModal';
import AddExpenseModal from '../components/AddExpenseModal';
import { ArrowLeft, UserPlus, Plus, DollarSign, List, TrendingUp, Users, Shield, Calendar } from 'lucide-react';

const GroupDetailView = ({ groupId, onBack, onShowToast }) => {
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [debts, setDebts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'balances'

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [settling, setSettling] = useState(false);

  const fetchGroupData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [groupDetails, expenseList, balanceList, debtList] = await Promise.all([
        groupService.getById(groupId),
        expenseService.getByGroup(groupId),
        balanceService.getBalances(groupId),
        balanceService.getSimplifiedDebts(groupId)
      ]);

      setGroup(groupDetails);
      setExpenses(Array.isArray(expenseList) ? expenseList : []);
      setBalances(Array.isArray(balanceList) ? balanceList : []);
      setDebts(Array.isArray(debtList) ? debtList : []);
    } catch (err) {
      onShowToast(err.message || 'Failed to load group workspace', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, onShowToast]);

  useEffect(() => {
    fetchGroupData(false);
  }, [fetchGroupData]);

  const handleSettleUp = async () => {
    if (debts.length === 0) {
      onShowToast('All debts are already settled!', 'warning');
      return;
    }

    if (window.confirm('Settle Up: This will mark all outstanding balances in this group as fully paid and cleared. Proceed?')) {
      setSettling(true);
      try {
        await settlementService.settleUp(groupId);
        onShowToast('All debts settled successfully!', 'success');
        fetchGroupData(true);
      } catch (err) {
        onShowToast(err.message || 'Failed to settle debts', 'danger');
      } finally {
        setSettling(false);
      }
    }
  };

  const handleExpenseDeleted = (expenseId) => {
    setExpenses(prev => prev.filter(e => e.expenseId !== expenseId));
    // Silent refresh to update balances
    fetchGroupData(true);
  };

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Loading workspace...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="full-screen-loader">
        <p style={{ color: 'hsl(var(--danger))' }}>Group details not found.</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const isAdmin = group.role === 'ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Header Navigation bar */}
      <header style={{
        background: 'hsla(var(--bg-surface-glass))',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid hsla(var(--border-color))',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.5rem 1rem' }}>
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <div style={{ height: '24px', width: '1px', background: 'hsla(var(--border-color))' }}></div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'hsl(var(--text-main))' }}>
              {group.groupName}
            </h2>
            <span className="badge badge-gray" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '2px' }}>
              Role: {group.role}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isAdmin && (
            <button
              className="btn btn-secondary"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <UserPlus size={16} />
              Add Member
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="dashboard-layout" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Sidebar Info Column */}
        <aside className="sidebar" style={{
          height: 'calc(100vh - 73px)',
          top: '73px',
          borderRight: '1px solid hsla(var(--border-color))',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '2rem'
        }}>
          {/* Group description */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.5rem' }}>
              Description
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-main))', background: 'hsla(var(--bg-main), 0.3)', border: '1px solid hsla(var(--border-color))', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              {group.groupDescription || 'No description provided.'}
            </p>
          </div>

          {/* Members list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Members ({group.members ? group.members.length : 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {group.members && group.members.map(member => (
                <div
                  key={member.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'hsla(var(--bg-main), 0.2)',
                    border: '1px solid hsla(var(--border-color))',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                        {member.username}
                      </span>
                      {member.userId === user?.userId && (
                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))' }}>(You)</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {member.email}
                    </span>
                  </div>

                  <span className={`badge ${member.role === 'ADMIN' ? 'badge-success' : 'badge-gray'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>
                    {member.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          {debts.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, hsla(var(--warning), 0.08), hsla(var(--secondary), 0.08))',
                border: '1px solid hsla(var(--warning), 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: 'auto'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'hsl(var(--warning))', textTransform: 'uppercase' }}>
                Pending Debts
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                {debts.length} Transactions
              </span>
              <button
                className="btn btn-primary"
                onClick={handleSettleUp}
                disabled={settling}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, hsl(var(--warning)), hsl(var(--secondary)))',
                  boxShadow: 'none'
                }}
              >
                {settling ? <div className="spinner" style={{ width: '12px', height: '12px' }}></div> : 'Settle Group Debts'}
              </button>
            </div>
          )}
        </aside>

        {/* Content Workspace Area */}
        <main style={{ padding: '2rem', overflowY: 'auto', height: 'calc(100vh - 73px)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* View Tabs Selector */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid hsla(var(--border-color))',
              gap: '1.5rem',
              marginBottom: '0.5rem'
            }}>
              <button
                onClick={() => setActiveTab('expenses')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: '2px solid ' + (activeTab === 'expenses' ? 'hsl(var(--primary))' : 'transparent'),
                  color: activeTab === 'expenses' ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))',
                  padding: '0.75rem 0.25rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <List size={18} />
                Expenses List
              </button>

              <button
                onClick={() => setActiveTab('balances')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: '2px solid ' + (activeTab === 'balances' ? 'hsl(var(--primary))' : 'transparent'),
                  color: activeTab === 'balances' ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))',
                  padding: '0.75rem 0.25rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <TrendingUp size={18} />
                Balances & Settlements
              </button>

              {refreshing && (
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
                  <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
                </div>
              )}
            </div>

            {/* Render Tab Contents */}
            {activeTab === 'expenses' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Transactions Ledger</h3>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    {expenses.length} expense(s) logged
                  </span>
                </div>

                {expenses.length > 0 ? (
                  expenses.map(exp => (
                    <ExpenseCard
                      key={exp.expenseId}
                      expense={exp}
                      isAdmin={isAdmin}
                      currentUser={user}
                      onDelete={handleExpenseDeleted}
                      onShowToast={onShowToast}
                    />
                  ))
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
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'hsl(var(--primary))'
                    }}>
                      <DollarSign size={28} />
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '700' }}>No Expenses Logged</h4>
                    <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '350px', fontSize: '0.85rem' }}>
                      There are no expenses logged in this group yet. Click "Add Expense" to split your first bill!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <BalanceBoard
                balances={balances}
                debts={debts}
                currentUser={user}
                onSettleClick={handleSettleUp}
                loading={false}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add Member Modal Overlay */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        groupId={groupId}
        existingMembers={group.members}
        onMemberAdded={() => fetchGroupData(true)}
        onShowToast={onShowToast}
      />

      {/* Add Expense Modal Overlay */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groupId={groupId}
        groupMembers={group.members}
        onExpenseAdded={() => fetchGroupData(true)}
        onShowToast={onShowToast}
      />
    </div>
  );
};

export default GroupDetailView;
