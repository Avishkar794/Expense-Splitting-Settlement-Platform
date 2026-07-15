package com.avishkar.ExpenseMgmt.dto;

import com.avishkar.ExpenseMgmt.enums.SplitType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CreateExpenseRequest {

    private String title;
    private String description;
    private BigDecimal amount;
    private Long paidById;

    @Enumerated(EnumType.STRING)
    private SplitType splitType;

    private List<ParticipantSplitRequest> participantSplits;

}
