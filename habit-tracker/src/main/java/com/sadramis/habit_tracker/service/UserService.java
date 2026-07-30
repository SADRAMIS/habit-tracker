package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.RegistrationRequest;
import com.sadramis.habit_tracker.dto.UserDto;
import com.sadramis.habit_tracker.exception.EmailAlreadyExistsException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto registerUser(RegistrationRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email уже используется: " + request.getEmail());
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);
        user.setRole("ROLE_USER");

        User savedUser = userRepository.save(user);
        return new UserDto(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
    }
}
