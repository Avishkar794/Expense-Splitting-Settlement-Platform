package com.avishkar.ExpenseMgmt.repository;

import com.avishkar.ExpenseMgmt.model.ExpenseParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipant, Long> {



}
