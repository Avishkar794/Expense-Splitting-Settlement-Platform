import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { expenseService } from '../services/api';
import { DollarSign, Percent, AlertCircle } from 'lucide-react';

const AddExpenseModal = ({ isOpen, onClose, groupId, groupMembers, onExpenseAdded, onShowToast }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  
  // Participant split selection/inputs
  // Structure: { [userId]: { checked: boolean, value: string } }
  const [shares, setShares] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form state when modal opens
  useEffect(() => {
    if (isOpen && groupMembers && groupMembers.length > 0) {
      setTitle('');
      setDescription('');
      setAmount('');
      setPaidById(groupMembers[0].userId.toString());
      setSplitType('EQUAL');

      // Initialize all members as checked/active
      const initialShares = {};
      groupMembers.forEach(m => {
        initialShares[m.userId] = {
          checked: true,
          value: ''
        };
      });
      setShares(initialShares);
    }
  }, [isOpen, groupMembers]);


  const handleCheckboxChange = (userId) => {
    // Cannot uncheck the payer (backend rule: paid user must be one of the participants)
    if (userId === parseInt(paidById, 10)) {
      onShowToast("The person who paid must be included in the split.", "warning");
      return;
    }

    setShares(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        checked: !prev[userId].checked
      }
    }));
  };

  const handleValueChange = (userId, value) => {
    setShares(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        value: value
      }
    }));
  };

  // Calculations
  const numericAmount = parseFloat(amount) || 0;
  const activeMembers = Object.keys(shares).filter(id => shares[id].checked).map(Number);
  const activeCount = activeMembers.length;

  const equalSplitAmount = activeCount > 0 ? (numericAmount / activeCount) : 0;

  // Compute exact/percentage sums
  let currentSum = 0;
  if (splitType === 'EXACT') {
    activeMembers.forEach(id => {
      currentSum += parseFloat(shares[id].value) || 0;
    });
  } else if (splitType === 'PERCENTAGE') {
    activeMembers.forEach(id => {
      currentSum += parseFloat(shares[id].value) || 0;
    });
  }

  const isMathValid = () => {
    if (numericAmount <= 0) return false;
    if (activeCount === 0) return false;

    // Check if payer is included
    const payerIdNum = parseInt(paidById, 10);
    if (!shares[payerIdNum]?.checked) return false;

    if (splitType === 'EQUAL') {
      return true;
    }
    if (splitType === 'EXACT') {
      // Allow slight floating point tolerance
      return Math.abs(currentSum - numericAmount) < 0.01;
    }
    if (splitType === 'PERCENTAGE') {
      return Math.abs(currentSum - 100) < 0.01;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      onShowToast('Title is required', 'warning');
      return;
    }
    if (numericAmount <= 0) {
      onShowToast('Amount must be greater than zero', 'warning');
      return;
    }

    const payerIdNum = parseInt(paidById, 10);
    if (!shares[payerIdNum]?.checked) {
      onShowToast('The payer must be one of the participants', 'warning');
      return;
    }

    // Build splits
    const participantSplits = [];
    let validationError = null;

    for (let id of activeMembers) {
      const userId = Number(id);
      const inputVal = parseFloat(shares[userId].value) || 0;

      if (splitType === 'EQUAL') {
        participantSplits.push({
          participantId: userId,
          sharedAmount: equalSplitAmount
        });
      } else if (splitType === 'EXACT') {
        if (inputVal <= 0) {
          validationError = "All active participants must have a share amount greater than zero.";
          break;
        }
        participantSplits.push({
          participantId: userId,
          sharedAmount: inputVal
        });
      } else if (splitType === 'PERCENTAGE') {
        if (inputVal <= 0) {
          validationError = "All active participants must have a percentage greater than zero.";
          break;
        }
        participantSplits.push({
          participantId: userId,
          sharedPercentage: inputVal
        });
      }
    }

    if (validationError) {
      onShowToast(validationError, 'warning');
      return;
    }

    // Math check
    if (splitType === 'EXACT' && Math.abs(currentSum - numericAmount) >= 0.01) {
      onShowToast(`Exact split total ($${currentSum.toFixed(2)}) must equal expense amount ($${numericAmount.toFixed(2)})`, 'warning');
      return;
    }
    if (splitType === 'PERCENTAGE' && Math.abs(currentSum - 100) >= 0.01) {
      onShowToast(`Percentage split total (${currentSum.toFixed(1)}%) must equal 100%`, 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const expenseData = {
        title,
        description,
        amount: numericAmount,
        paidById: payerIdNum,
        splitType,
        participantSplits
      };

      await expenseService.create(groupId, expenseData);
      onShowToast('Expense added successfully', 'success');
      onExpenseAdded();
      onClose();
    } catch (err) {
      onShowToast(err.message || 'Failed to add expense', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Expense">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label htmlFor="exp-title">Title</label>
            <input
              id="exp-title"
              type="text"
              className="input-field"
              placeholder="e.g. Dinner, Fuel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label htmlFor="exp-amount">Amount ($)</label>
            <input
              id="exp-amount"
              type="number"
              step="0.01"
              min="0.01"
              className="input-field"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label htmlFor="exp-desc">Description (Optional)</label>
          <input
            id="exp-desc"
            type="text"
            className="input-field"
            placeholder="Additional context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label htmlFor="exp-payer">Paid By</label>
            <select
              id="exp-payer"
              className="input-field"
              value={paidById}
              onChange={(e) => {
                const val = e.target.value;
                setPaidById(val);
                setShares(prev => {
                  const userId = parseInt(val, 10);
                  if (prev[userId] && !prev[userId].checked) {
                    return {
                      ...prev,
                      [userId]: { ...prev[userId], checked: true }
                    };
                  }
                  return prev;
                });
              }}
              disabled={submitting}
            >
              {groupMembers && groupMembers.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.username}
                </option>
              ))}
            </select>
          </div>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label htmlFor="exp-split">Split Strategy</label>
            <select
              id="exp-split"
              className="input-field"
              value={splitType}
              onChange={(e) => setSplitType(e.target.value)}
              disabled={submitting}
            >
              <option value="EQUAL">Split Equally</option>
              <option value="EXACT">Exact Amounts</option>
              <option value="PERCENTAGE">Percentages</option>
            </select>
          </div>
        </div>

        {/* Dynamic Splits Form Section */}
        <div style={{
          border: '1px solid hsla(var(--border-color))',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem',
          background: 'hsla(var(--bg-main), 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Split Participants
            </span>
            {splitType !== 'EQUAL' && (
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: '700', 
                color: isMathValid() ? 'hsl(var(--success))' : 'hsl(var(--warning))',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {splitType === 'EXACT' ? (
                  <>Sum: ${currentSum.toFixed(2)} / ${numericAmount.toFixed(2)}</>
                ) : (
                  <>Sum: {currentSum.toFixed(1)}% / 100%</>
                )}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {groupMembers && groupMembers.map(m => {
              const userShare = shares[m.userId] || { checked: false, value: '' };
              const isPayer = m.userId === parseInt(paidById, 10);
              
              return (
                <div 
                  key={m.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    background: 'hsla(var(--bg-surface), 0.5)',
                    border: '1px solid hsla(var(--border-color))',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isPayer ? 'not-allowed' : 'pointer', fontSize: '0.9rem', flexGrow: 1, userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={userShare.checked}
                      onChange={() => handleCheckboxChange(m.userId)}
                      disabled={submitting || isPayer}
                      style={{ cursor: isPayer ? 'not-allowed' : 'pointer' }}
                    />
                    <span style={{ fontWeight: userShare.checked ? '600' : '400' }}>
                      {m.username} {isPayer && <span style={{ color: 'hsl(var(--primary))', fontSize: '0.75rem' }}>(Payer)</span>}
                    </span>
                  </label>

                  {userShare.checked && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '120px' }}>
                      {splitType === 'EQUAL' && (
                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', width: '100%', textAlign: 'right', paddingRight: '0.5rem' }}>
                          ${equalSplitAmount.toFixed(2)}
                        </span>
                      )}
                      
                      {splitType === 'EXACT' && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                          <DollarSign size={12} style={{ position: 'absolute', left: '6px', color: 'hsl(var(--text-muted))' }} />
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="input-field"
                            style={{ padding: '0.35rem 0.5rem 0.35rem 1.25rem', width: '100%', fontSize: '0.85rem' }}
                            placeholder="0.00"
                            value={userShare.value}
                            onChange={(e) => handleValueChange(m.userId, e.target.value)}
                            disabled={submitting}
                            required
                          />
                        </div>
                      )}

                      {splitType === 'PERCENTAGE' && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            max="100"
                            className="input-field"
                            style={{ padding: '0.35rem 1.25rem 0.35rem 0.5rem', width: '100%', fontSize: '0.85rem', textAlign: 'right' }}
                            placeholder="0"
                            value={userShare.value}
                            onChange={(e) => handleValueChange(m.userId, e.target.value)}
                            disabled={submitting}
                            required
                          />
                          <Percent size={12} style={{ position: 'absolute', right: '6px', color: 'hsl(var(--text-muted))' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning Indicator */}
        {amount && !isMathValid() && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'hsla(var(--danger), 0.1)',
            border: '1px solid hsla(var(--danger), 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            color: 'hsl(var(--danger))',
            fontSize: '0.8rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>
              {splitType === 'EXACT' 
                ? `Sum of participant amounts ($${currentSum.toFixed(2)}) must exactly equal total amount ($${numericAmount.toFixed(2)}).`
                : splitType === 'PERCENTAGE'
                ? `Sum of participant percentages (${currentSum.toFixed(1)}%) must exactly equal 100%.`
                : activeCount === 0 
                ? 'Please select at least one split participant.' 
                : ''}
            </span>
          </div>
        )}

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
            disabled={submitting || !isMathValid()}
          >
            {submitting ? <div className="spinner"></div> : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddExpenseModal;
