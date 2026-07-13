package com.avishkar.ExpenseMgmt.dto;

import com.avishkar.ExpenseMgmt.enums.GroupRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDetailsResponse {

    private Long groupId;
    private String groupName;
    private String groupDescription;
    private Long createdBy;
    private GroupRole role;

    private List<MemberResponse> members;

    // Getters and Setters
}
