package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TerminUpdateDto {
    @NotNull
    private Integer idKorisnik;

    @NotNull
    private String datumVrijeme;

    private String odgoda;
}
