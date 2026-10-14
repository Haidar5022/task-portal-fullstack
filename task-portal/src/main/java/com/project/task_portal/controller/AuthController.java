package com.project.task_portal.controller;

import com.project.task_portal.dto.LoginRequestDto;
import com.project.task_portal.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtils jwtUtils;

    public AuthController(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginDto) {
        if ("admin".equals(loginDto.getUsername()) && "admin123".equals(loginDto.getPassword())) {
            String jwt = jwtUtils.generateToken(loginDto.getUsername());
            return ResponseEntity.ok(Map.of(
                "token", jwt,
                "username", loginDto.getUsername(),
                "role", "ADMIN"
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid username or password"));
    }
}