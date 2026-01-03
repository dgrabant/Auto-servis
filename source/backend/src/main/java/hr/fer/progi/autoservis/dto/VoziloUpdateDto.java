package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoziloUpdateDto {
    private Integer idKorisnik;

    private Integer idVrsta;

    @Size(max = 10)
    private String regOznaka;

    private Short godinaProizvodnje;

    @Size(max = 100)
    private String serijskiBroj;

    private Boolean jeZamjensko = false;
}
