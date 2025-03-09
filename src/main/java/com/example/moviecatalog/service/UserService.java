package com.example.moviecatalog.service;

import com.example.moviecatalog.model.User;
import com.example.moviecatalog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Find user by username
     * @param username Username to search
     * @return User details
     * @throws UsernameNotFoundException if user not found
     */
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    /**
     * Find user by email
     * @param email Email to search
     * @return User details
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Update user profile
     * @param username Username of the user to update
     * @param userDetails Updated user details
     * @return Updated user
     */
    @Transactional
    public User updateProfile(String username, User userDetails) {
        User existingUser = findByUsername(username);

        // Update email if provided and not already in use
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email is already in use");
            }
            existingUser.setEmail(userDetails.getEmail());
        }

        // Update timestamp
        existingUser.setUpdatedAt(LocalDateTime.now());

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
        User user = findByUsername(username);

        // Verify current password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Encode and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Get all users (admin functionality)
     * @return List of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Delete user account
     * @param username Username of the user to delete
     */
    @Transactional
    public void deleteUser(String username) {
        User user = findByUsername(username);
        userRepository.delete(user);
    }

    /**
     * Check if username is available
     * @param username Username to check
     * @return true if username is available, false otherwise
     */
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    /**
     * Check if email is available
     * @param email Email to check
     * @return true if email is available, false otherwise
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
}
