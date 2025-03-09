package com.example.moviecatalog.security;

import com.example.moviecatalog.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Arrays;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private AuthService authService;
    
    // List of public paths that don't require authentication
    private final List<String> publicPaths = Arrays.asList(
        "/api/public/",
        "/api/auth/login",
        "/api/auth/register"
    );

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Lazy
    @Autowired
    public void setAuthService(AuthService authService) {
        this.authService = authService;
    }
    
    /**
     * Check if the request path is a public path that doesn't require authentication
     */
    private boolean isPublicPath(String requestPath) {
        return publicPaths.stream().anyMatch(requestPath::startsWith);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // Get the request path
            String requestPath = request.getRequestURI();
            
            // Debug log the request path
            logger.info("Request path: " + requestPath);
            
            // Skip token validation for public paths
            if (isPublicPath(requestPath)) {
                logger.info("Skipping token validation for public path: " + requestPath);
                filterChain.doFilter(request, response);
                return;
            }
            
            // Extract JWT token from the request
            String token = extractTokenFromRequest(request);

            // Validate token and set authentication
            if (token != null && jwtTokenUtil.validateToken(token)) {
                // Extract username from token
                String username = jwtTokenUtil.getUsernameFromToken(token);
                logger.info("Extracted username from token: " + username);

                // Load user details
                UserDetails userDetails = authService.loadUserByUsername(username);
                logger.info("Loaded user details: " + userDetails);

                // Create authentication object with roles from userDetails
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                logger.info("Created authentication: " + authentication);

                // Set authentication details
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Set authentication in security context");
            } else if (token != null) {
                logger.info("Token validation failed");
            }
        } catch (Exception ex) {
            logger.error("Cannot set user authentication", ex);
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     * @param request HttpServletRequest
     * @return JWT token or null
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}