package hr.fer.progi.autoservis.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TerminUpdateDto {
    private Integer idKorisnik;

    private String datumVrijeme;

    private String odgoda;
}
