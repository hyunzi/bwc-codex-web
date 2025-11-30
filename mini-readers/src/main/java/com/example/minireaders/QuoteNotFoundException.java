package com.example.minireaders;

public class QuoteNotFoundException extends RuntimeException {

    public QuoteNotFoundException(Long id) {
        super("Quote %d not found".formatted(id));
    }
}
