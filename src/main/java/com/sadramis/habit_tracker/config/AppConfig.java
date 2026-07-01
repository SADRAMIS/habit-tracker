package com.sadramis.habit_tracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ForkJoinPool;

@Configuration
public class AppConfig {

    @Bean
    public ForkJoinPool forkJoinPool() {
        return new ForkJoinPool(4);
    }
}
