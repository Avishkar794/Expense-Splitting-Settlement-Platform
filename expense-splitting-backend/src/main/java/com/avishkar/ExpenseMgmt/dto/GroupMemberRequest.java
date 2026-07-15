package com.avishkar.ExpenseMgmt.dto;

import lombok.Data;

import java.util.List;

@Data
public class GroupMemberRequest {

    List<Long> memberIds;

}
