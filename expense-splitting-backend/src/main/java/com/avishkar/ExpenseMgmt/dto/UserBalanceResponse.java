package com.avishkar.ExpenseMgmt.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserBalanceResponse {

    private Long userId;
    private String username;
    private BigDecimal netBalance;

}
