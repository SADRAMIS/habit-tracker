package com.sadramis.habit_tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableCaching
@EnableDiscoveryClient
public class HabitTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(HabitTrackerApplication.class, args);
	}

}
