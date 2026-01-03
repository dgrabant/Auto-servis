package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoziloCreateDto {
    private Integer idKorisnik;

    @NotNull
    private Integer idVrsta;

    @NotNull
    @Size(max = 10)
    private String regOznaka;

    private Short godinaProizvodnje;

    @Size(max = 100)
    private String serijskiBroj;

    @NotNull
    private Boolean jeZamjensko = false;
}
