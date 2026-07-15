package com.avishkar.ExpenseMgmt.dto;

import com.avishkar.ExpenseMgmt.enums.SplitType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExpenseDetailsResponse {

    private Long expenseId;

    private String title;

    private String description;

    private BigDecimal amount;

    private String paidBy;

    private SplitType splitType;

    private LocalDateTime createdAt;

    private List<ExpenseParticipantResponse> participants;

}
