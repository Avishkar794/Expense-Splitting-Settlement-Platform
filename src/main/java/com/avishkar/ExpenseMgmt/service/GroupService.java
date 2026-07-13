package com.avishkar.ExpenseMgmt.service;

import com.avishkar.ExpenseMgmt.dto.*;
import com.avishkar.ExpenseMgmt.enums.GroupRole;
import com.avishkar.ExpenseMgmt.model.Group;
import com.avishkar.ExpenseMgmt.model.GroupMember;
import com.avishkar.ExpenseMgmt.model.User;
import com.avishkar.ExpenseMgmt.repository.GroupMemberRepository;
import com.avishkar.ExpenseMgmt.repository.GroupRepository;
import com.avishkar.ExpenseMgmt.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class GroupService {

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Transactional
    public Long createGroup(CreateGroupRequest request) {

        Group group = new Group();
        group.setGroupName(request.getGroupName());
        group.setGroupDescription(request.getGroupDescription());
        group.setCreatedAt(LocalDateTime.now());

        // Get the currently authenticated user
        User user = currentUserService.getCurrentUser();

        group.setCreatedBy(user.getId());

        // Save the group to the database

        Group savedGroup = groupRepository.save(group);

        GroupMember groupMember = new GroupMember();
        groupMember.setGroupId(savedGroup.getGroupId());
        groupMember.setUserId(user.getId());
        groupMember.setRole(GroupRole.ADMIN);
        groupMember.setJoinedAt(LocalDateTime.now());

        groupMemberRepository.save(groupMember);

        return savedGroup.getGroupId();
    }

    @Transactional
    public void addMemberToGroup(GroupMemberRequest request, Long groupId) {

        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found");
        }

        User currentUser = currentUserService.getCurrentUser();

        // Check if the current user is an admin of the group

        GroupMember currentUserMembership = groupMemberRepository.findByGroupIdAndUserId(groupId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Current user is not a member of the group"));

        if (currentUserMembership.getRole() != GroupRole.ADMIN) {
            throw new RuntimeException("Only admins can add members");
        }

        Set<Long> uniqueMemberIds = new HashSet<>(request.getMemberIds());

        for (Long memberId : uniqueMemberIds) {

            User member = userRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("User with ID " + memberId + " not found"));

            // Check if the user is already a member of the group
            if (groupMemberRepository.existsByGroupIdAndUserId(groupId, member.getId())) {
                throw new RuntimeException("User with ID " + memberId + " is already a member of the group");
            }

            GroupMember groupMember = new GroupMember();
            groupMember.setGroupId(groupId);
            groupMember.setUserId(member.getId());
            groupMember.setRole(GroupRole.MEMBER);
            groupMember.setJoinedAt(LocalDateTime.now());

            groupMemberRepository.save(groupMember);

        }

    }

    public List<GroupSummaryResponse> getAllGroups() {

        User user = currentUserService.getCurrentUser();

        List<GroupMember> memberships = groupMemberRepository.findByUserId(user.getId());

        List<Long> groupIds = memberships.stream()
                .map(GroupMember::getGroupId)
                .toList();

        List<Group> groups = groupRepository.findByGroupIdIn(groupIds);

        if (groupIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<GroupSummaryResponse> groupSummaryRespons = new ArrayList<>();

        for (Group group : groups) {
            GroupSummaryResponse groupSummaryResponse = new GroupSummaryResponse();
            groupSummaryResponse.setGroupId(group.getGroupId());
            groupSummaryResponse.setGroupName(group.getGroupName());
            groupSummaryResponse.setGroupDescription(group.getGroupDescription());

            // Get the role of the current user in this group
            GroupMember membership = memberships.stream()
                    .filter(m -> m.getGroupId().equals(group.getGroupId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Membership not found for group " + group.getGroupId()));

            groupSummaryResponse.setRole(membership.getRole());;

            groupSummaryRespons.add(groupSummaryResponse);
        }

        return groupSummaryRespons;
    }

    public GroupDetailsResponse getGroupDetailsResponse(Long groupId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User currentUser = currentUserService.getCurrentUser();

        GroupMember currentUserMembership = groupMemberRepository.findByGroupIdAndUserId(groupId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("You are not a member of the group"));

        GroupDetailsResponse groupDetailsResponse = new GroupDetailsResponse();
        groupDetailsResponse.setGroupId(group.getGroupId());
        groupDetailsResponse.setGroupName(group.getGroupName());
        groupDetailsResponse.setGroupDescription(group.getGroupDescription());
        groupDetailsResponse.setCreatedBy(group.getCreatedBy());
        groupDetailsResponse.setRole(currentUserMembership.getRole());

        List<GroupMember> groupMembers = (List<GroupMember>) groupMemberRepository.findByGroupId(groupId);

        List<MemberResponse> memberResponses = new ArrayList<>();

        for (GroupMember groupMember : groupMembers) {
            User user = userRepository.findById(groupMember.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            MemberResponse memberResponse = new MemberResponse();
            memberResponse.setUserId(user.getId());
            memberResponse.setUsername(user.getUsername());
            memberResponse.setEmail(user.getEmail());
            memberResponse.setRole(groupMember.getRole());
            memberResponses.add(memberResponse);
        }

        groupDetailsResponse.setMembers(memberResponses);
        return groupDetailsResponse;
    }
}
