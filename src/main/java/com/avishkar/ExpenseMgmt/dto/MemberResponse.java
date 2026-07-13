package com.avishkar.ExpenseMgmt.dto;

import com.avishkar.ExpenseMgmt.enums.GroupRole;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class MemberResponse {

    private Long userId;
    private String username;
    private String email;
    private GroupRole role;

    // Getters and Setters
}
