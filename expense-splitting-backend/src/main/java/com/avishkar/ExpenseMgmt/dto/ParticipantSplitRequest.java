package com.avishkar.ExpenseMgmt.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ParticipantSplitRequest {

    private Long participantId;
    private BigDecimal sharedAmount;
    private BigDecimal sharedPercentage;

}
