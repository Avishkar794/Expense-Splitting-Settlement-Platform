package com.avishkar.ExpenseMgmt.strategy;

import com.avishkar.ExpenseMgmt.dto.ParticipantSplitRequest;
import com.avishkar.ExpenseMgmt.model.Expense;
import com.avishkar.ExpenseMgmt.model.ExpenseParticipant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class ExactSplitStrategy implements SplitStrategy{

    @Override
    public List<ExpenseParticipant> calculateShares(Expense expense, List<ParticipantSplitRequest> participants) {
        List<ExpenseParticipant> expenseParticipants = new ArrayList<>();

        BigDecimal totalSharedAmt = BigDecimal.ZERO;

        for(ParticipantSplitRequest participantSplitRequest : participants) {
            totalSharedAmt = totalSharedAmt.add(participantSplitRequest.getSharedAmount());
        }

        if(totalSharedAmt.compareTo(expense.getAmount()) != 0) {
            throw new RuntimeException("Sum of all shares must equal total expense amount");
        }

        for(ParticipantSplitRequest participantSplitRequest : participants) {

            if (participantSplitRequest.getSharedAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Share amount must be greater than zero");
            }

            ExpenseParticipant expenseParticipant = new ExpenseParticipant();

            expenseParticipant.setExpenseId(expense.getExpenseId());
            expenseParticipant.setUserId(participantSplitRequest.getParticipantId());
            expenseParticipant.setShareAmount(participantSplitRequest.getSharedAmount());

            expenseParticipants.add(expenseParticipant);
        }

        return expenseParticipants;
    }
}
