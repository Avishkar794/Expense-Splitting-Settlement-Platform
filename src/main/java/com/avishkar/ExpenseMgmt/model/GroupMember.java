package com.avishkar.ExpenseMgmt.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Table(name = "group_members")
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long groupId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String role; // e.g., "admin", "member"

    @Column(nullable = false)
    private LocalDateTime joinedAt;

}
