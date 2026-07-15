package com.avishkar.ExpenseMgmt.dto;

import com.avishkar.ExpenseMgmt.enums.SplitType;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Setter
@Getter
public class ExpenseSummaryResponse {

    private Long expenseId;
    private String title;
    private BigDecimal amount;
    private String paidBy;
    private SplitType splitType;
    private LocalDateTime createdAt;

}
