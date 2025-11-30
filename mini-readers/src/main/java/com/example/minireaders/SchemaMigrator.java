package com.example.minireaders;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
class SchemaMigrator implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigrator.class);
    private final JdbcTemplate jdbcTemplate;

    SchemaMigrator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void afterPropertiesSet() {
        ensureMoodTagsColumn();
    }

    private void ensureMoodTagsColumn() {
        Integer tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'quotes'",
                Integer.class);
        if (tableExists == null || tableExists == 0) {
            log.info("quotes table does not exist yet. Skipping mood_tags migration until initialization");
            return;
        }
        Integer columnCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM pragma_table_info('quotes')
                WHERE lower(name) = ?
                """, Integer.class, "mood_tags");
        if (columnCount != null && columnCount == 0) {
            log.info("Adding mood_tags column to quotes table");
            jdbcTemplate.execute("ALTER TABLE quotes ADD COLUMN mood_tags TEXT");
        }
    }
}
