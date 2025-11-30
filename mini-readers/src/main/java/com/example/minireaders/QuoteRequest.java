package com.example.minireaders;

import java.util.List;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuoteRequest(
        @NotBlank @Size(max = 500) String passage,
        @Size(max = 400) String note,
        @Size(max = 3) List<@NotBlank @Size(max = 20) String> moods) {

    @AssertTrue(message = "소감 또는 감정 태그 중 하나는 반드시 입력해주세요.")
    public boolean isEitherNoteOrMoodsPresent() {
        boolean hasNote = note != null && !note.isBlank();
        boolean hasMoods = moods != null && moods.stream().anyMatch(mood -> mood != null && !mood.isBlank());
        return hasNote || hasMoods;
    }
}
