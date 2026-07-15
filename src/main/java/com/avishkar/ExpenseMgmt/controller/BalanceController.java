package com.avishkar.ExpenseMgmt.controller;

import com.avishkar.ExpenseMgmt.dto.SimplifiedDebtResponse;
import com.avishkar.ExpenseMgmt.dto.UserBalanceResponse;
import com.avishkar.ExpenseMgmt.service.BalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/")
public class BalanceController {

    @Autowired
    private BalanceService balanceService;

    @GetMapping("/groups/{groupId}/balances")
    public ResponseEntity<List<UserBalanceResponse>> getBalances(@PathVariable(value = "groupId") Long groupId) {

        List<UserBalanceResponse> responses = balanceService.getGroupBalances(groupId);

        return ResponseEntity.status(HttpStatus.OK).body(responses);
    }

    @GetMapping("/groups/{groupId}/simplified-debts")
    public ResponseEntity<List<SimplifiedDebtResponse>> getSimplifiedDebts(@PathVariable(value = "groupId") Long groupId) {

        List<SimplifiedDebtResponse> responses = balanceService.getSimplifiedDebts(groupId);

        return ResponseEntity.status(HttpStatus.OK).body(responses);
    }


}
