package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.RegistrationRequest;
import com.sadramis.habit_tracker.dto.UserDto;
import com.sadramis.habit_tracker.exception.EmailAlreadyExistsException;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private UserService userService;

    @Test
    public void registerUser_ShouldReturnUserDto_WhenEmailIsNew() {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("new@example.com");
        request.setPassword("password123");
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("new@example.com");
        savedUser.setRole("ROLE_USER");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDto result = userService.registerUser(request);
        assertEquals("new@example.com", result.getEmail());
        assertEquals("ROLE_USER", result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void registerUser_ShouldThrowException_WhenEmailAlreadyExists() {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("existing@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        assertThrows(EmailAlreadyExistsException.class, () -> userService.registerUser(request));

        verify(userRepository, never()).save(any());
    }

}
