// Auditing Configuration for JPA Entities
package com.example.moviecatalog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class AuditingConfig {
    // Enables automatic timestamp and user tracking for entities
}