package com.avishkar.ExpenseMgmt.controller;

import com.avishkar.ExpenseMgmt.dto.UserSearchResponse;
import com.avishkar.ExpenseMgmt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(@RequestParam String query) {

        List<UserSearchResponse> responseList = userService.searchUsers(query);

        return ResponseEntity.ok(responseList);
    }

}
