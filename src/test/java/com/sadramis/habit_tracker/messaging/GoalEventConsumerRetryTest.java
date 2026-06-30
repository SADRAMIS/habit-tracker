package com.sadramis.habit_tracker.messaging;

import com.sadramis.habit_tracker.dto.GoalCompletedEvent;
import com.sadramis.habit_tracker.service.GoalService;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;

import java.util.concurrent.CompletableFuture;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
public class GoalEventConsumerRetryTest {

    @Mock
    private GoalService goalService;

    @InjectMocks
    private GoalEventConsumer consumer;

    @Test
    void shouldThrowExceptionWhenSimulateErrorEnabled() {
        consumer.setSimulateError(true);
        GoalCompletedEvent event = new GoalCompletedEvent(1L, 1L, "test");

        assertThatThrownBy(() -> consumer.handle(event))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Имитация ошибки");
    }

    @Test
    void shouldSendToDeadLetterTopicAfterRetriesExhausted() {
        KafkaTemplate<String, String> kafkaTemplate = mock(KafkaTemplate.class);
        doReturn(CompletableFuture.completedFuture(null))
                .when(kafkaTemplate).send(any(ProducerRecord.class));
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(kafkaTemplate,
                (record, exception) -> new TopicPartition("goal-events.DLT", record.partition()));

        ConsumerRecord<String, String> record = new ConsumerRecord<>("goal-events", 0, 0L, "key", "value");
        Exception error = new RuntimeException("Test exception");

        recoverer.accept(record, error);

        verify(kafkaTemplate).send(any(ProducerRecord.class));
    }
}
