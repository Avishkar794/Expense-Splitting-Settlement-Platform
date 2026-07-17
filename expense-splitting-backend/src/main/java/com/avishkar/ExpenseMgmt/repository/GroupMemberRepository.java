package com.avishkar.ExpenseMgmt.repository;

import com.avishkar.ExpenseMgmt.model.Group;
import com.avishkar.ExpenseMgmt.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    Boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    List<GroupMember> findByGroupId(Long groupId);

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    List<Group> findByGroupIdIn(List<Long> groupIds);

    List<GroupMember> findByUserId(Long id);

    void deleteByGroupId(Long groupId);
}
