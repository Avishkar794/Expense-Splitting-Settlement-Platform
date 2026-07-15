package com.avishkar.ExpenseMgmt.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Data
@Getter
@Setter
public class BalanceNode {
    private Long id;
    private BigDecimal amount;
}
