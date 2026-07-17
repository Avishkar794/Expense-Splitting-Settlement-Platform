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
public class PercentageSplitStrategy implements SplitStrategy{
    @Override
    public List<ExpenseParticipant> calculateShares(Expense expense, List<ParticipantSplitRequest> participants) {
        List<ExpenseParticipant> expenseParticipants = new ArrayList<>();

        BigDecimal totalPrec = BigDecimal.ZERO;

        for(ParticipantSplitRequest participantSplitRequest : participants) {
            totalPrec = totalPrec.add(participantSplitRequest.getSharedPercentage());
        }

        if(totalPrec.compareTo(BigDecimal.valueOf(100)) != 0) {
            throw new RuntimeException("Sum of percentage split should be 100");
        }

        BigDecimal totalAmount = expense.getAmount();
        BigDecimal allocated = BigDecimal.ZERO;
        int n = participants.size();

        for (int i = 0; i < n; i++) {
            ParticipantSplitRequest participantSplitRequest = participants.get(i);

            if (participantSplitRequest.getSharedPercentage().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Percentage must be greater than zero");
            }

            BigDecimal perc = participantSplitRequest.getSharedPercentage();

            ExpenseParticipant expenseParticipant = new ExpenseParticipant();

            expenseParticipant.setExpenseId(expense.getExpenseId());
            expenseParticipant.setUserId(participantSplitRequest.getParticipantId());
            expenseParticipant.setPercentage(perc);

            if (i == n - 1) {
                expenseParticipant.setShareAmount(totalAmount.subtract(allocated));
            } else {
                BigDecimal sharedAmt = totalAmount
                        .multiply(perc)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                expenseParticipant.setShareAmount(sharedAmt);
                allocated = allocated.add(sharedAmt);
            }

            expenseParticipants.add(expenseParticipant);
        }

        return expenseParticipants;
    }
}
