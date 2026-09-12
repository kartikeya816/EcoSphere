
package com.ecosphere.ecosphere.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.ecosphere.ecosphere.entity.User;
import com.ecosphere.ecosphere.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserService userService,
            PasswordEncoder passwordEncoder) {

        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PostMapping("/admin/register")
    public User registerAdmin(@RequestBody User user) {

        user.setRole("ADMIN");

        return userService.createUser(user);
    }
    @PostMapping("/admin/login")
    public User adminLogin(@RequestBody User user) {

        List<User> users = userService.getUsers();

        for (User existingUser : users) {

            if (existingUser.getEmail().equals(user.getEmail())
                    && passwordEncoder.matches(
                    user.getPassword(),
                    existingUser.getPassword())
                    && "ADMIN".equals(existingUser.getRole())) {

                return existingUser;
            }
        }

        throw new RuntimeException("Invalid admin email or password");
    }
}