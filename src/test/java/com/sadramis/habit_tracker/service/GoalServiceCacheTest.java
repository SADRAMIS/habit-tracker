package com.sadramis.habit_tracker.service;

import com.sadramis.habit_tracker.dto.GoalDto;
import com.sadramis.habit_tracker.model.Goal;
import com.sadramis.habit_tracker.model.User;
import com.sadramis.habit_tracker.repository.GoalRepository;
import com.sadramis.habit_tracker.repository.ProgressRepository;
import com.sadramis.habit_tracker.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@SpringBootTest
@Import(GoalServiceCacheTest.TestConfig.class)
@TestPropertySource(properties = {
        "app.jwt.secret=test-secret-key-for-cache-test",
        "app.jwt.expiration-ms=3600000"
})
public class GoalServiceCacheTest {

    @MockitoBean
    private GoalRepository goalRepository;

    @MockitoBean
    private ProgressRepository progressRepository;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private GoalService goalService;

    @TestConfiguration
    @EnableCaching
    static class TestConfig {
        @Bean
        public CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("user_goals");
        }
    }

    @Test
    void shouldCacheUserGoals() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Goal goal = new Goal();
        goal.setId(1L);
        goal.setTitle("Test Goal");
        goal.setDescription("Test");
        goal.setTargetValue(10.0);
        goal.setDeadline(Instant.now());
        goal.setUser(user);

        when(goalRepository.findByUser_Id(userId))
                .thenReturn(Collections.singletonList(goal));

        when(progressRepository.sumValueByGoalId(anyLong())).thenReturn(5.0);

        List<GoalDto> firstCall = goalService.getUserGoals(userId);

        List<GoalDto> secondCall = goalService.getUserGoals(userId);

        assertThat(firstCall).hasSize(1);
        assertThat(secondCall).hasSize(1);
        assertThat(firstCall.get(0).getTitle()).isEqualTo("Test Goal");
        assertThat(secondCall.get(0).getTitle()).isEqualTo("Test Goal");

        verify(goalRepository, times(1)).findByUser_Id(userId);
    }
}
