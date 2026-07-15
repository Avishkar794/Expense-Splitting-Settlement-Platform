package com.avishkar.ExpenseMgmt.controller;

import com.avishkar.ExpenseMgmt.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    @PostMapping("/groups/{groupId}/settle-up")
    public ResponseEntity<String> settleUp(@PathVariable(value = "groupId") Long groupId) {

        settlementService.settleUp(groupId);

        return ResponseEntity.ok("All debts settled successfully.");
    }

}
