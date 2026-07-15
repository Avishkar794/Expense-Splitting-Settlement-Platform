package com.avishkar.ExpenseMgmt.service;

import com.avishkar.ExpenseMgmt.dto.UserSearchResponse;
import com.avishkar.ExpenseMgmt.model.User;
import com.avishkar.ExpenseMgmt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurrentUserService currentUserService;

    public List<UserSearchResponse> searchUsers(String query) {

        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        List<User> users = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);

        List<UserSearchResponse> responses = new ArrayList<>();

        User currentUser = currentUserService.getCurrentUser();

        for(User user : users) {

            if (user.getId().equals(currentUser.getId())) {
                continue;
            }

            UserSearchResponse userSearchResponse = new UserSearchResponse();

            userSearchResponse.setUserId(user.getId());
            userSearchResponse.setUsername(user.getUsername());
            userSearchResponse.setEmail(user.getEmail());
            responses.add(userSearchResponse);
        }

        return responses;
    }
}
