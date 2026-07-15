package com.avishkar.ExpenseMgmt.controller;

import com.avishkar.ExpenseMgmt.dto.JwtResponse;
import com.avishkar.ExpenseMgmt.dto.LoginRequest;
import com.avishkar.ExpenseMgmt.dto.RegisterRequest;
import com.avishkar.ExpenseMgmt.model.User;
import com.avishkar.ExpenseMgmt.service.AuthService;
import com.avishkar.ExpenseMgmt.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request){

        authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(
            @RequestBody LoginRequest request){

        return ResponseEntity.ok(authService.login(request));
    }
}
