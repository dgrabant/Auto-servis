package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServisiranjeDto {
    @NotNull
    private Integer idPopravak;

    @NotNull
    private Integer idKorisnik;
}
