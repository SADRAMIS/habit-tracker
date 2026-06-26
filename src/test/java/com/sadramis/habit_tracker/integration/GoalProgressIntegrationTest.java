package com.sadramis.habit_tracker.integration;

import com.sadramis.habit_tracker.dto.GoalDto;
import com.sadramis.habit_tracker.dto.GoalRequest;
import com.sadramis.habit_tracker.dto.ProgressRequest;
import com.sadramis.habit_tracker.dto.RegistrationRequest;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class GoalProgressIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCompleteGoalAndSendKafkaEvent() throws Exception {
        String token = registerAndLogin("test@example.com", "password123");
        Long goalId = createGoal(token, "Читать книги", 10.0);

        addProgress(token, goalId, 3.0);  // событие НЕ отправляется

        addProgress(token, goalId, 8.0);  // событие отправляется

        // Создаём consumer и читаем топик
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "manual-test-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false"); // опционально

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            consumer.subscribe(List.of("goal-events"));
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
            assertThat(records.count()).isPositive();
            String event = records.iterator().next().value();
            assertThat(event).contains("Поздравляем! Вы достигли цели");
        }
    }

    private String registerAndLogin(String email, String password) {
        // Регистрация
        RegistrationRequest regRequest = new RegistrationRequest();
        regRequest.setEmail(email);
        regRequest.setPassword(password);
        ResponseEntity<Map> regResponse = restTemplate.postForEntity("/api/v1/users/register", regRequest, Map.class);
        assertThat(regResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Логин
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> loginRequest = new HttpEntity<>(
                Map.of("email", email, "password", password), headers);
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity("/api/v1/auth/login", loginRequest, Map.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        return (String) loginResponse.getBody().get("token");
    }

    private Long createGoal(String token, String title, double targetValue) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        GoalRequest goalRequest = new GoalRequest();
        goalRequest.setTitle(title);
        goalRequest.setDescription("Test description");
        goalRequest.setTargetValue(targetValue);
        goalRequest.setDeadline(Instant.parse("2026-07-01T00:00:00Z"));

        HttpEntity<GoalRequest> request = new HttpEntity<>(goalRequest, headers);
        ResponseEntity<GoalDto> response = restTemplate.postForEntity("/api/v1/goals", request, GoalDto.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody().getId();
    }

    private void addProgress(String token, Long goalId, double value) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ProgressRequest progressRequest = new ProgressRequest();
        progressRequest.setGoalId(goalId);
        progressRequest.setProgressValue(value);
        progressRequest.setDate(Instant.now());

        HttpEntity<ProgressRequest> request = new HttpEntity<>(progressRequest, headers);
        ResponseEntity<Void> response = restTemplate.postForEntity("/api/v1/progress", request, Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

    }
}