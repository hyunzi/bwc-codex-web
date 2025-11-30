package com.example.minireaders;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuoteService {

    private final QuoteRepository repository;

    public QuoteService(QuoteRepository repository) {
        this.repository = repository;
    }

    public List<Quote> listQuotes() {
        return repository.findAll();
    }

    @Transactional
    public Quote createQuote(QuoteRequest request) {
        String passage = request.passage().trim();
        String note = trimToNull(request.note());
        List<String> moods = sanitizeMoods(request.moods());
        Quote quote = new Quote(null, passage, note, moods, OffsetDateTime.now());
        return repository.save(quote);
    }

    public Quote shareableQuote(Long id) {
        return repository.findById(id).orElseThrow(() -> new QuoteNotFoundException(id));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private List<String> sanitizeMoods(List<String> raw) {
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        return raw.stream()
                .filter(mood -> mood != null && !mood.isBlank())
                .map(String::trim)
                .filter(mood -> !mood.isEmpty())
                .distinct()
                .limit(3)
                .toList();
    }
}
