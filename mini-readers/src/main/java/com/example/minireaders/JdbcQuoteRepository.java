package com.example.minireaders;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcQuoteRepository implements QuoteRepository {

    private final JdbcTemplate jdbcTemplate;

    public JdbcQuoteRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Quote save(Quote quote) {
        String sql = "INSERT INTO quotes (passage, note, mood_tags, created_at) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            var ps = con.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, quote.passage());
            ps.setString(2, quote.note());
            ps.setString(3, serializeMoods(quote.moods()));
            ps.setString(4, quote.createdAt().toString());
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        return new Quote(key != null ? key.longValue() : null, quote.passage(), quote.note(), quote.moods(), quote.createdAt());
    }

    @Override
    public List<Quote> findAll() {
        return jdbcTemplate.query("SELECT id, passage, note, mood_tags, created_at FROM quotes ORDER BY id DESC", this::mapRow);
    }

    @Override
    public Optional<Quote> findById(Long id) {
        List<Quote> results = jdbcTemplate.query("SELECT id, passage, note, mood_tags, created_at FROM quotes WHERE id = ?", this::mapRow, id);
        return results.stream().findFirst();
    }

    private Quote mapRow(ResultSet rs, int rowNum) throws SQLException {
        OffsetDateTime createdAt = OffsetDateTime.parse(rs.getString("created_at"));
        return new Quote(
                rs.getLong("id"),
                rs.getString("passage"),
                rs.getString("note"),
                deserializeMoods(rs.getString("mood_tags")),
                createdAt);
    }

    private String serializeMoods(List<String> moods) {
        if (moods == null || moods.isEmpty()) {
            return "";
        }
        return String.join(",", moods);
    }

    private List<String> deserializeMoods(String stored) {
        if (stored == null || stored.isBlank()) {
            return List.of();
        }
        return List.of(stored.split("\\s*,\\s*"));
    }
}
