package com.example.minireaders;

import java.time.OffsetDateTime;
import java.util.List;

public record Quote(Long id, String passage, String note, List<String> moods, OffsetDateTime createdAt) {
}
