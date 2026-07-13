package com.avishkar.ExpenseMgmt.controller;

import com.avishkar.ExpenseMgmt.dto.CreateGroupRequest;
import com.avishkar.ExpenseMgmt.dto.GroupDetailsResponse;
import com.avishkar.ExpenseMgmt.dto.GroupMemberRequest;
import com.avishkar.ExpenseMgmt.dto.GroupSummaryResponse;
import com.avishkar.ExpenseMgmt.model.Group;
import com.avishkar.ExpenseMgmt.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping
    public List<GroupSummaryResponse> getAllGroups() {
        // Implement logic to retrieve all groups
        return groupService.getAllGroups();
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDetailsResponse> getGroupById(@PathVariable Long groupId) {

        GroupDetailsResponse groupDetailsResponse = groupService.getGroupDetailsResponse(groupId);

        return ResponseEntity.ok(groupDetailsResponse);
    }

    @PostMapping("/create")
    public ResponseEntity<String> createGroup(@RequestBody CreateGroupRequest request) {

        Long groupId = groupService.createGroup(request);

        return ResponseEntity.status(HttpStatus.CREATED).body("Group created successfully with groupId: " + groupId);
    }

    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<String> addMemberToGroup(@RequestBody GroupMemberRequest request,
                                                   @PathVariable(value = "groupId") Long groupId) {

//        System.out.println("Controller reached");

        groupService.addMemberToGroup(request, groupId);

//        System.out.println("Controller finished");
        return ResponseEntity.ok("Member added to group successfully");
    }

}
