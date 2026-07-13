package com.avishkar.ExpenseMgmt.config;

import com.avishkar.ExpenseMgmt.model.User;
import com.avishkar.ExpenseMgmt.model.UserPrincipal;
import com.avishkar.ExpenseMgmt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository repo;


    @Override
    public UserDetails loadUserByUsername(String useremail) throws UsernameNotFoundException {

        Optional<User> user = repo.findByEmail(useremail);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }

        return new UserPrincipal(user.get());
    }

}