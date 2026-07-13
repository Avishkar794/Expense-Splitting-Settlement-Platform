package com.avishkar.ExpenseMgmt.dto;

import com.avishkar.ExpenseMgmt.enums.GroupRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupSummaryResponse {
    private Long groupId;
    private String groupName;
    private String groupDescription;
    @Setter
    @Getter
    private GroupRole role; // This will hold the role of the user in the group (e.g., "ADMIN", "MEMBER")
}
