package com.moneytracker.controller;

import com.moneytracker.dto.ChangePasswordRequest;
import com.moneytracker.dto.UpdateUserRequest;
import com.moneytracker.dto.UserResponse;
import com.moneytracker.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserResponse());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateUser(@RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok().build();
    }
}
