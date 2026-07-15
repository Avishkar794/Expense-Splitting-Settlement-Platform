package com.avishkar.ExpenseMgmt.service;

import com.avishkar.ExpenseMgmt.dto.*;
import com.avishkar.ExpenseMgmt.factory.SplitStrategyFactory;
import com.avishkar.ExpenseMgmt.model.Expense;
import com.avishkar.ExpenseMgmt.model.ExpenseParticipant;
import com.avishkar.ExpenseMgmt.model.Group;
import com.avishkar.ExpenseMgmt.model.User;
import com.avishkar.ExpenseMgmt.repository.*;
import com.avishkar.ExpenseMgmt.strategy.SplitStrategy;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ExpenseService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseParticipantRepository expenseParticipantRepository;

    @Autowired
    private SplitStrategyFactory strategyFactory;

    @Autowired
    private CurrentUserService currentUserService;

    @Transactional
    public Long addExpense(CreateExpenseRequest createExpenseRequest, Long groupId) {

        if (createExpenseRequest.getTitle() == null ||
                createExpenseRequest.getTitle().isBlank()) {
            throw new RuntimeException("Title cannot be empty");
        }

        if(!groupRepository.existsById(groupId)){
            throw new RuntimeException("Group not found");
        }

        if (createExpenseRequest.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        List<ParticipantSplitRequest> participants = createExpenseRequest.getParticipantSplits();

        if(participants == null || participants.isEmpty()) {
            throw new RuntimeException("Expense must have at least one participant");
        }

        if(!groupMemberRepository.existsByGroupIdAndUserId(groupId, createExpenseRequest.getPaidById())) {
            throw new RuntimeException("Paid user does not belong to this group");
        }

        boolean payerIncluded = participants.stream()
                .anyMatch(p -> p.getParticipantId().equals(createExpenseRequest.getPaidById()));

        if (!payerIncluded) {
            throw new RuntimeException("Paid user must be one of the participants");
        }

        Set<Long> pastUserId = new HashSet<>();
        for (ParticipantSplitRequest participant : participants) {
            Long userId = participant.getParticipantId();

            // user exists?
            if(!userRepository.existsById(userId)){
                throw new RuntimeException("User does not exist");
            }

            // is member of group?
            if(!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)){
                throw new RuntimeException("User does not belong to this group");
            }

            // duplicate user?
            if (!pastUserId.add(userId)) {
                throw new RuntimeException("Duplicate users are not allowed");
            }
        }

        Expense expense = new Expense();
        expense.setAmount(createExpenseRequest.getAmount());
        expense.setTitle(createExpenseRequest.getTitle());
        expense.setDescription(createExpenseRequest.getDescription());
        expense.setGroupId(groupId);
        expense.setPaidBy(createExpenseRequest.getPaidById());
        expense.setSplitType(createExpenseRequest.getSplitType());
        expense.setCreatedAt(LocalDateTime.now());


        Expense savedExpense = expenseRepository.save(expense);

        SplitStrategy strategy = strategyFactory.getStrategy(createExpenseRequest.getSplitType());

        List<ExpenseParticipant> expenseParticipants =
                strategy.calculateShares(savedExpense, participants);

        expenseParticipantRepository.saveAll(expenseParticipants);

        return savedExpense.getExpenseId();
    }


    public List<ExpenseSummaryResponse> getAllExpenses(Long groupId) {

        if(!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group does not exist");
        }

        User user = currentUserService.getCurrentUser();

        if(!groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new RuntimeException("You does not belong to this group");
        }

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        List<ExpenseSummaryResponse> expenseSummaryResponseList =  new ArrayList<>();

        for(Expense expense : expenses) {
            ExpenseSummaryResponse response = new ExpenseSummaryResponse();
            response.setExpenseId(expense.getExpenseId());
            response.setTitle(expense.getTitle());
            response.setAmount(expense.getAmount());

            Long paidUserId = expense.getPaidBy();

            User paidUser = userRepository.findById(paidUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            response.setPaidBy(paidUser.getUsername());

            response.setSplitType(expense.getSplitType());

            response.setCreatedAt(expense.getCreatedAt());

            expenseSummaryResponseList.add(response);
        }

        return expenseSummaryResponseList;
    }

    public ExpenseDetailsResponse getExpenseDetails(Long expenseId) {

        if(!expenseRepository.existsById(expenseId)) {
            throw new RuntimeException("Expense does not exist");
        }

        User currentUser = currentUserService.getCurrentUser();

        if(!expenseParticipantRepository.existsByExpenseIdAndUserId(expenseId, currentUser.getId())) {
            throw new RuntimeException("You're not participated in this expense");
        }

        Expense expense = expenseRepository.getReferenceById(expenseId);

        ExpenseDetailsResponse response = new ExpenseDetailsResponse();
        response.setExpenseId(expense.getExpenseId());
        response.setTitle(expense.getTitle());
        response.setDescription(expense.getDescription());

        User paidUser = userRepository.getReferenceById(expense.getPaidBy());

        response.setPaidBy(paidUser.getUsername());
        response.setSplitType(expense.getSplitType());
        response.setCreatedAt(expense.getCreatedAt());
        response.setAmount(expense.getAmount());

        List<ExpenseParticipant> expenseParticipants = expenseParticipantRepository.findByExpenseId(expenseId);

        List<ExpenseParticipantResponse> participants = new ArrayList<>();

        for (ExpenseParticipant expenseParticipant : expenseParticipants) {

            User participantUser =
                    userRepository.getReferenceById(expenseParticipant.getUserId());

            ExpenseParticipantResponse participantResponse =
                    new ExpenseParticipantResponse();

            participantResponse.setUserId(participantUser.getId());
            participantResponse.setUsername(participantUser.getUsername());
            participantResponse.setShareAmount(expenseParticipant.getShareAmount());
            participantResponse.setPercentage(expenseParticipant.getPercentage());

            participants.add(participantResponse);
        }

        response.setParticipants(participants);

        return response;
    }

    @Transactional
    public void deleteExpense(Long expenseId) {

        if(!expenseRepository.existsById(expenseId)) {
            throw new RuntimeException("Expense does not exist");
        }

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense does not exist"));

        Long groupId = expense.getGroupId();

        User currentUser = currentUserService.getCurrentUser();

        if(!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new RuntimeException("User does not belong to the this group");
        }

        expenseParticipantRepository.deleteByExpenseId(expenseId);

        expenseRepository.delete(expense);
    }
}
