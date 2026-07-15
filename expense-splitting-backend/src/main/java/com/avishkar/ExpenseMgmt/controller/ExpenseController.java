package com.avishkar.ExpenseMgmt.controller;

import com.avishkar.ExpenseMgmt.dto.CreateExpenseRequest;
import com.avishkar.ExpenseMgmt.dto.ExpenseDetailsResponse;
import com.avishkar.ExpenseMgmt.dto.ExpenseSummaryResponse;
import com.avishkar.ExpenseMgmt.service.ExpenseService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping("/groups/{groupId}/expenses")
    public ResponseEntity<String> addExpense(@RequestBody CreateExpenseRequest createExpenseRequest, @PathVariable(value = "groupId") Long groupId) {

        Long expenseId = expenseService.addExpense(createExpenseRequest, groupId);

        return ResponseEntity.status(HttpStatus.CREATED).body("Expense added successfully");
    }

    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<List<ExpenseSummaryResponse>> getAllExpenses(@PathVariable(value = "groupId") Long groupId) {

        List<ExpenseSummaryResponse> expenses = expenseService.getAllExpenses(groupId);

        return ResponseEntity.status(HttpStatus.OK).body(expenses);
    }

    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<ExpenseDetailsResponse> getExpenseDetails(@PathVariable(value = "expenseId") Long expenseId) {

        ExpenseDetailsResponse response = expenseService.getExpenseDetails(expenseId);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    @DeleteMapping("/expenses/{expenseId}")
    public ResponseEntity<?> deleteExpense(@PathVariable(value = "expenseId") Long expenseId) {

        expenseService.deleteExpense(expenseId);

        return ResponseEntity.status(HttpStatus.OK).body("Expense deleted successfully");
    }
}
