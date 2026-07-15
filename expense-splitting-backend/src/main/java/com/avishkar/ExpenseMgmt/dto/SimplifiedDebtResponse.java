package com.avishkar.ExpenseMgmt.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SimplifiedDebtResponse {

    private Long payerId;

    private String payer;

    private Long receiverId;

    private String receiver;

    private BigDecimal amount;

}
