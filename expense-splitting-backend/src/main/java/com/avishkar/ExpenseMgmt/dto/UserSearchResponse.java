package com.avishkar.ExpenseMgmt.dto;

import lombok.Data;

@Data
public class UserSearchResponse {

    private Long userId;

    private String username;

    private String email;

}