package com.avishkar.ExpenseMgmt.repository;

import com.avishkar.ExpenseMgmt.model.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
}
