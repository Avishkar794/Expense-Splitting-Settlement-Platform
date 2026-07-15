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

        BigDecimal sharedAmount = expense.getAmount()
                .divide(BigDecimal.valueOf(participants.size()), 2, RoundingMode.HALF_UP);

        for(ParticipantSplitRequest participantSplitRequest : participants) {
            ExpenseParticipant expenseParticipant = new ExpenseParticipant();

            expenseParticipant.setExpenseId(expense.getExpenseId());
            expenseParticipant.setUserId(participantSplitRequest.getParticipantId());
            expenseParticipant.setShareAmount(sharedAmount);

            expenseParticipants.add(expenseParticipant);
        }

        return expenseParticipants;
    }
}
