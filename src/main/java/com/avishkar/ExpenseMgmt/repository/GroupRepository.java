package com.avishkar.ExpenseMgmt.repository;

import com.avishkar.ExpenseMgmt.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
}
