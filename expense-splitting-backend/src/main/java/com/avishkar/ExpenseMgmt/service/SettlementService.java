package com.avishkar.ExpenseMgmt.service;

import com.avishkar.ExpenseMgmt.dto.SimplifiedDebtResponse;
import com.avishkar.ExpenseMgmt.model.Settlement;
import com.avishkar.ExpenseMgmt.model.User;
import com.avishkar.ExpenseMgmt.repository.GroupMemberRepository;
import com.avishkar.ExpenseMgmt.repository.GroupRepository;
import com.avishkar.ExpenseMgmt.repository.SettlementRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SettlementService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private  GroupMemberRepository groupMemberRepository;

    @Autowired
    private BalanceService balanceService;

    @Autowired
    private SettlementRepository settlementRepository;

    @Transactional
    public void settleUp(Long groupId) {

        if(!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group does not exist");
        }

        User currentUser = currentUserService.getCurrentUser();

        if(!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new RuntimeException("Cannot settle-up because You does not belong to this group");
        }

        List<SimplifiedDebtResponse> responseList = balanceService.getSimplifiedDebts(groupId);

        if (responseList.isEmpty()) {
            throw new RuntimeException("No pending debts to settle");
        }

        List<Settlement> settlements = new ArrayList<>();

        for(SimplifiedDebtResponse response : responseList) {
            Settlement settlement = new Settlement();

            settlement.setPayerId(response.getPayerId());
            settlement.setReceiverId(response.getReceiverId());
            settlement.setAmount(response.getAmount());
            settlement.setGroupId(groupId);
            settlement.setSettledAt(LocalDateTime.now());

            settlements.add(settlement);
        }

        settlementRepository.saveAll(settlements);
    }
}
