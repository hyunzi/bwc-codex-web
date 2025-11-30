package com.example.minireaders;

import java.util.List;
import java.util.Optional;

public interface QuoteRepository {

    Quote save(Quote quote);

    List<Quote> findAll();

    Optional<Quote> findById(Long id);
}
