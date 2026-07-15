package com.avishkar.ExpenseMgmt.strategy;

import com.avishkar.ExpenseMgmt.dto.ParticipantSplitRequest;
import com.avishkar.ExpenseMgmt.model.Expense;
import com.avishkar.ExpenseMgmt.model.ExpenseParticipant;

import java.util.List;

public interface SplitStrategy {
    List<ExpenseParticipant> calculateShares(Expense expense, List<ParticipantSplitRequest> participants);
}
