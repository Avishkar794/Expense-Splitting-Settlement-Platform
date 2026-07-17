package com.avishkar.ExpenseMgmt.service;

import com.avishkar.ExpenseMgmt.dto.BalanceNode;
import com.avishkar.ExpenseMgmt.dto.SimplifiedDebtResponse;
import com.avishkar.ExpenseMgmt.dto.UserBalanceResponse;
import com.avishkar.ExpenseMgmt.model.*;
import com.avishkar.ExpenseMgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

@Service
public class BalanceService {

    @Autowired
    private ExpenseParticipantRepository expenseParticipantRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public Map<Long, BigDecimal> calculateBalances(Long groupId) {
        Map<Long, BigDecimal> balances = new HashMap<>();

        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);

        for (GroupMember member : members) {
            balances.put(member.getUserId(), BigDecimal.ZERO);
        }

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        for(Expense expense : expenses) {

            Long paidByUserId = expense.getPaidBy();
            BigDecimal paidAmount = expense.getAmount();

            balances.put(paidByUserId, balances.getOrDefault(paidByUserId, BigDecimal.ZERO).add(paidAmount));

            List<ExpenseParticipant> expenseParticipants = expenseParticipantRepository.findByExpenseId(expense.getExpenseId());

            for(ExpenseParticipant expenseParticipant : expenseParticipants) {

                Long participantId = expenseParticipant.getUserId();
                BigDecimal participantAmount = expenseParticipant.getShareAmount();

                balances.put(participantId, balances.getOrDefault(participantId, BigDecimal.ZERO).subtract(participantAmount));
            }

        }

        List<Settlement> settlements = settlementRepository.findByGroupId(groupId);

        for(Settlement settlement : settlements) {
            Long payerId = settlement.getPayerId();
            Long receiverId = settlement.getReceiverId();
            BigDecimal amount = settlement.getAmount();

            balances.put(
                    payerId,
                    balances.getOrDefault(payerId, BigDecimal.ZERO)
                            .add(amount)
            );

            balances.put(
                    receiverId,
                    balances.getOrDefault(receiverId, BigDecimal.ZERO)
                            .subtract(amount)
            );
        }

        return balances;
    }

    public List<UserBalanceResponse> getGroupBalances(Long groupId) {

        if(!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group does not exist");
        }

        Map<Long, BigDecimal> balances = calculateBalances(groupId);

        List<UserBalanceResponse> response = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {

            User user = userRepository.getReferenceById(entry.getKey());

            UserBalanceResponse balance = new UserBalanceResponse();
            balance.setUserId(user.getId());
            balance.setUsername(user.getUsername());
            balance.setNetBalance(entry.getValue());

            response.add(balance);
        }

        return response;
    }

    public List<SimplifiedDebtResponse> getSimplifiedDebts(Long groupId) {

        if(!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group does not exist");
        }

        Map<Long, BigDecimal> balances = calculateBalances(groupId);

        PriorityQueue<BalanceNode> creditors = new PriorityQueue<>(
                (a, b) -> b.getAmount().compareTo(a.getAmount())
        );

        PriorityQueue<BalanceNode> debtors = new PriorityQueue<>(
                Comparator.comparing(BalanceNode::getAmount)
        );

        for(Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
            BigDecimal net = entry.getValue();

            BalanceNode balanceNode = new BalanceNode();
            balanceNode.setId(entry.getKey());
            balanceNode.setAmount(entry.getValue());

            if (net.compareTo(BigDecimal.ZERO) > 0) {
                creditors.offer(balanceNode);
            } else if (net.compareTo(BigDecimal.ZERO) < 0) {
                debtors.offer(balanceNode);
            }
        }

        List<SimplifiedDebtResponse> simplifiedDebts = new ArrayList<>();

        while(!creditors.isEmpty() && !debtors.isEmpty()) {

            BalanceNode creditor = creditors.poll();
            BalanceNode debtor = debtors.poll();

            BigDecimal creditAmount = creditor.getAmount();
            BigDecimal debitAmount = debtor.getAmount().abs();

            BigDecimal settleAmount = creditAmount.min(debitAmount);

            User payer = userRepository.getReferenceById(debtor.getId());
            User receiver = userRepository.getReferenceById(creditor.getId());

            SimplifiedDebtResponse response = new SimplifiedDebtResponse();

            response.setPayerId(payer.getId());
            response.setPayer(payer.getUsername());

            response.setReceiverId(receiver.getId());
            response.setReceiver(receiver.getUsername());

            response.setAmount(settleAmount);

            simplifiedDebts.add(response);

            creditor.setAmount(creditAmount.subtract(settleAmount));

            debtor.setAmount(debtor.getAmount().add(settleAmount));

            if (creditor.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                creditors.offer(creditor);
            }

            if (debtor.getAmount().compareTo(BigDecimal.ZERO) < 0) {
                debtors.offer(debtor);
            }
        }

        return simplifiedDebts;
    }
}
