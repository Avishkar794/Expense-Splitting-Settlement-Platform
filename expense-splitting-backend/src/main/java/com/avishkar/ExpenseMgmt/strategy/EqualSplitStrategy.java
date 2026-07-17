package com.avishkar.ExpenseMgmt.strategy;

import com.avishkar.ExpenseMgmt.dto.ParticipantSplitRequest;
import com.avishkar.ExpenseMgmt.model.Expense;
import com.avishkar.ExpenseMgmt.model.ExpenseParticipant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class EqualSplitStrategy implements SplitStrategy {

    @Override
    public List<ExpenseParticipant> calculateShares(Expense expense, List<ParticipantSplitRequest> participants) {

        List<ExpenseParticipant> expenseParticipants = new ArrayList<>();
        int n = participants.size();
        if (n == 0) {
            return expenseParticipants;
        }

        BigDecimal sharedAmount = expense.getAmount()
                .divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);

        BigDecimal allocated = BigDecimal.ZERO;

        for (int i = 0; i < n; i++) {
            ParticipantSplitRequest participantSplitRequest = participants.get(i);
            ExpenseParticipant expenseParticipant = new ExpenseParticipant();

            expenseParticipant.setExpenseId(expense.getExpenseId());
            expenseParticipant.setUserId(participantSplitRequest.getParticipantId());

            if (i == n - 1) {
                expenseParticipant.setShareAmount(expense.getAmount().subtract(allocated));
            } else {
                expenseParticipant.setShareAmount(sharedAmount);
                allocated = allocated.add(sharedAmount);
            }

            expenseParticipants.add(expenseParticipant);
        }

        return expenseParticipants;
    }
}
