package com.example.minireaders;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @GetMapping
    public List<Quote> listQuotes() {
        return quoteService.listQuotes();
    }

    @PostMapping
    public ResponseEntity<Quote> createQuote(@Validated @RequestBody QuoteRequest request) {
        Quote saved = quoteService.createQuote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/share")
    public SharePayload share(@PathVariable Long id) {
        Quote quote = quoteService.shareableQuote(id);
        return SharePayload.fromQuote(quote);
    }

    @ExceptionHandler(QuoteNotFoundException.class)
    ResponseEntity<ApiError> handleQuoteNotFound(QuoteNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError(ex.getMessage()));
    }

    public record SharePayload(String title, String passage, String note, List<String> moods, String signature) {
        private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");

        static SharePayload fromQuote(Quote quote) {
            String title = "Mini Readers 추천 구절 #" + quote.id();
            String signature = "기록일 " + DATE_FORMATTER.format(quote.createdAt());
            return new SharePayload(title, quote.passage(), quote.note(), quote.moods(), signature);
        }
    }

    public record ApiError(String message) {
    }
}
