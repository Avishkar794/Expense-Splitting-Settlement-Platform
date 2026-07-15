package com.avishkar.ExpenseMgmt.repository;

import com.avishkar.ExpenseMgmt.model.ExpenseParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipant, Long> {

    boolean existsByExpenseIdAndUserId(Long expenseId, Long id);

    List<ExpenseParticipant> findByExpenseId(Long expenseId);

    void deleteByExpenseId(Long expenseId);
}
