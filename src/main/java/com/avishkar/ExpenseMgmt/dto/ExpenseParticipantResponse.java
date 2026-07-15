package com.avishkar.ExpenseMgmt.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseParticipantResponse {

    private Long userId;

    private String username;

    private BigDecimal shareAmount;

    private BigDecimal percentage;

}
