import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Calendar, DollarSign, PieChart } from 'lucide-react';
import { expenseService } from '../services/api';

const ExpenseCard = ({ expense, isAdmin, currentUser, onDelete, onShowToast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleExpand = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      if (!details) {
        setLoadingDetails(true);
        try {
          const fetchedDetails = await expenseService.getDetails(expense.expenseId);
          setDetails(fetchedDetails);
        } catch (err) {
          onShowToast(err.message || 'Failed to load expense details', 'danger');
          setIsExpanded(false);
        } finally {
          setLoadingDetails(false);
        }
      }
    } else {
      setIsExpanded(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      setDeleting(true);
      try {
        await expenseService.delete(expense.expenseId);
        onShowToast('Expense deleted successfully', 'success');
        if (onDelete) onDelete(expense.expenseId);
      } catch (err) {
        onShowToast(err.message || 'Failed to delete expense', 'danger');
        setDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="card" 
      onClick={toggleExpand}
      style={{
        cursor: 'pointer',
        padding: '1.25rem',
        marginBottom: '0.75rem',
        borderColor: isExpanded ? 'hsla(var(--primary), 0.4)' : 'hsla(var(--border-color))',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'hsla(var(--primary), 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--primary))',
            flexShrink: 0
          }}>
            <DollarSign size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: 'hsl(var(--text-main))', fontWeight: '600' }}>{expense.title}</h4>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '2px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Paid by: <strong style={{ color: 'hsl(var(--text-main))' }}>{expense.paidBy}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {formatDate(expense.createdAt)}
              </span>
              <span className="badge badge-gray" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                {expense.splitType}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'hsl(var(--text-main))' }}>
              ${expense.amount.toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isAdmin && (
              <button 
                className="btn-icon" 
                onClick={handleDelete}
                disabled={deleting}
                style={{ 
                  width: '32px', 
                  height: '32px',
                  color: 'hsl(var(--danger))',
                  backgroundColor: 'hsla(var(--danger), 0.1)',
                  borderColor: 'hsla(var(--danger), 0.2)'
                }}
                title="Delete expense"
              >
                {deleting ? <div className="spinner" style={{ width: '12px', height: '12px' }}></div> : <Trash2 size={14} />}
              </button>
            )}
            <button 
              className="btn-icon" 
              onClick={toggleExpand}
              style={{ width: '32px', height: '32px' }}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid hsla(var(--border-color))',
            fontSize: '0.9rem',
            cursor: 'default'
          }}
        >
          {loadingDetails ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
              <div className="spinner"></div>
            </div>
          ) : details ? (
            <div>
              {details.description && (
                <div style={{ marginBottom: '1rem', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
                  "{details.description}"
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PieChart size={12} /> Split Breakdown
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {details.participants && details.participants.map((p) => {
                    const isSelf = p.userId === currentUser?.userId;
                    return (
                      <div 
                        key={p.userId} 
                        style={{
                          background: 'hsla(var(--bg-main), 0.4)',
                          border: '1px solid hsla(var(--border-color))',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: isSelf ? '700' : '500', color: isSelf ? 'hsl(var(--primary))' : 'hsl(var(--text-main))' }}>
                            {p.username} {isSelf && '(You)'}
                          </span>
                          {p.percentage && (
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>
                              {p.percentage.toFixed(0)}% share
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: '600', color: 'hsl(var(--text-main))' }}>
                          ${p.shareAmount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'hsl(var(--danger))' }}>Could not load breakdown details.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
