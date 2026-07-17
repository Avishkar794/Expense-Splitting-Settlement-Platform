package com.avishkar.ExpenseMgmt.service;

import com.avishkar.ExpenseMgmt.dto.JwtResponse;
import com.avishkar.ExpenseMgmt.dto.LoginRequest;
import com.avishkar.ExpenseMgmt.dto.RegisterRequest;
import com.avishkar.ExpenseMgmt.model.User;
import com.avishkar.ExpenseMgmt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    public void register(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        // Save the user to the database

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

    }

    public JwtResponse login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(request.getEmail());
        return new JwtResponse(token);
    }
}
