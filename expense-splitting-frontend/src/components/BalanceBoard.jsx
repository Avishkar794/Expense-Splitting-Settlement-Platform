import React from 'react';
import { ArrowRight, CheckCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const BalanceBoard = ({ balances, debts, currentUser, onSettleClick, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Find if there are any debts
  const hasDebts = debts && debts.length > 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Net Balances Column */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Group Balances
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {balances && balances.map((b) => {
            const isSelf = b.userId === currentUser?.userId;
            const balanceVal = b.netBalance;
            const status = balanceVal > 0.001 ? 'owed' : balanceVal < -0.001 ? 'owes' : 'settled';
            
            return (
              <div 
                key={b.userId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  background: isSelf ? 'hsla(var(--primary), 0.05)' : 'hsla(var(--bg-main), 0.3)',
                  border: isSelf ? '1px solid hsla(var(--primary), 0.25)' : '1px solid hsla(var(--border-color))',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {status === 'owed' && <TrendingUp size={16} style={{ color: 'hsl(var(--success))' }} />}
                  {status === 'owes' && <TrendingDown size={16} style={{ color: 'hsl(var(--danger))' }} />}
                  {status === 'settled' && <CheckCircle size={16} style={{ color: 'hsl(var(--gray))' }} />}
                  <span style={{ fontWeight: isSelf ? '700' : '500', color: isSelf ? 'hsl(var(--primary))' : 'hsl(var(--text-main))' }}>
                    {b.username} {isSelf && '(You)'}
                  </span>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  {status === 'owed' && (
                    <span style={{ color: 'hsl(var(--success))', fontWeight: '700' }}>
                      Gets back ${balanceVal.toFixed(2)}
                    </span>
                  )}
                  {status === 'owes' && (
                    <span style={{ color: 'hsl(var(--danger))', fontWeight: '700' }}>
                      Owes ${Math.abs(balanceVal).toFixed(2)}
                    </span>
                  )}
                  {status === 'settled' && (
                    <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
                      Settled Up
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simplified Debts Column */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Suggested Settlements
        </h3>
        
        {!hasDebts ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '2rem 1rem',
            color: 'hsl(var(--text-muted))',
            textAlign: 'center',
            flexGrow: 1
          }}>
            <CheckCircle size={36} style={{ color: 'hsl(var(--success))', marginBottom: '0.5rem' }} />
            <strong style={{ color: 'hsl(var(--text-main))' }}>Everyone is Settled!</strong>
            <span>No transactions are required to balance the group.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '350px' }}>
            {debts.map((debt, index) => {
              const isPayerSelf = debt.payerId === currentUser?.userId;
              const isReceiverSelf = debt.receiverId === currentUser?.userId;
              
              return (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    background: 'hsla(var(--bg-main), 0.3)',
                    border: '1px solid hsla(var(--border-color))',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: isPayerSelf ? '700' : '500', color: isPayerSelf ? 'hsl(var(--primary))' : 'hsl(var(--text-main))' }}>
                        {debt.payer} {isPayerSelf && '(You)'}
                      </span>
                      <ArrowRight size={14} style={{ color: 'hsl(var(--text-muted))' }} />
                      <span style={{ fontWeight: isReceiverSelf ? '700' : '500', color: isReceiverSelf ? 'hsl(var(--primary))' : 'hsl(var(--text-main))' }}>
                        {debt.receiver} {isReceiverSelf && '(You)'}
                      </span>
                    </div>
                    
                    <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'hsl(var(--text-main))' }}>
                      ${debt.amount.toFixed(2)}
                    </span>
                  </div>

                  <button 
                    className="btn btn-secondary" 
                    onClick={() => onSettleClick(debt)}
                    style={{ 
                      width: '100%', 
                      padding: '0.4rem', 
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      background: isPayerSelf ? 'linear-gradient(135deg, hsla(var(--primary), 0.1), hsla(var(--secondary), 0.1))' : undefined,
                      borderColor: isPayerSelf ? 'hsla(var(--primary), 0.25)' : undefined,
                      color: isPayerSelf ? 'hsl(var(--primary))' : undefined
                    }}
                  >
                    <DollarSign size={12} />
                    Settle Debt
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceBoard;
