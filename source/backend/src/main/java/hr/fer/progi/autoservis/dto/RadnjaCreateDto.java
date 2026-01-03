package hr.fer.progi.autoservis.dto;

import hr.fer.progi.autoservis.service.RadnjaStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
public class RadnjaCreateDto {
    @Setter
    @NotNull
    private Integer idPopravak;

    @Setter
    @NotNull
    private Integer idKorisnik;

    @Setter
    private Integer idDijelausluge;

    @NotNull
    @Size(max = 20)
    private String stanje = "nepotvrđeno";

    @Setter
    @Size(max = 500)
    private String napomena;

    public void setStanje(String stanje) {
        if(RadnjaStatus.exists(stanje)) this.stanje = stanje;
    }
}
