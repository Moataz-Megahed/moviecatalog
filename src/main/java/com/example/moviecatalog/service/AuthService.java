package com.example.moviecatalog.service;

import com.example.moviecatalog.model.User;
import com.example.moviecatalog.repository.UserRepository;
import com.example.moviecatalog.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Lazy
    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Register a new user
     * @param user User to register
     * @return Registered user
     */
    @Transactional
    public User registerUser(User user) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default role if not specified
        if (user.getRole() == null) {
            user.setRole("ROLE_USER");
        }

        // Save user
        return userRepository.save(user);
    }

    /**
     * Authenticate user and generate JWT token
     * @param username Username
     * @param password Password
     * @return JWT token
     */
    public String login(String username, String password) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );

        // Generate JWT token
        return jwtTokenProvider.generateToken(authentication);
    }

    /**
     * Load user by username for Spring Security
     * @param username Username to load
     * @return UserDetails for authentication
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Create list of granted authorities based on user role
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority(user.getRole())
        );

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(), 
            user.getPassword(), 
            authorities
        );
    }

    /**
     * Check if a username is available
     * @param username Username to check
     * @return true if username is available, false otherwise
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    /**
     * Check if an email is available
     * @param email Email to check
     * @return true if email is available, false otherwise
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    /**
     * Update user profile
     * @param userId User ID
     * @param updatedUser Updated user information
     * @return Updated user
     */
    @Transactional
    public User updateUserProfile(Long userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields that are allowed to change
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }

        // If password is being updated, encode it
        if (updatedUser.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    /**
     * Change user password
     * @param username Username
     * @param oldPassword Current password
     * @param newPassword New password
     */
    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        // Encode and save new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
