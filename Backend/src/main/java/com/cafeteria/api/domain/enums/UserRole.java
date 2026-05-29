package com.cafeteria.api.domain.enums;

public enum UserRole {
    USER, ADMIN;

    public String authority() {
        return "ROLE_" + name();
    }
}
