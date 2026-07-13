package com.avishkar.ExpenseMgmt.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "settlements")
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long settlementId;

    @Column(nullable = false)
    private Long groupId;

    @Column(nullable = false)
    private Long payerId;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime settledAt;
}