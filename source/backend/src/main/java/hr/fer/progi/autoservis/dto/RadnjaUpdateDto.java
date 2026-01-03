package hr.fer.progi.autoservis.dto;

import hr.fer.progi.autoservis.service.RadnjaStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
public class RadnjaUpdateDto {
    @Setter
    private Integer idPopravak;

    @Setter
    private Integer idKorisnik;

    @Setter
    private Integer idDijelausluge;

    @Size(max = 20)
    private String stanje = "nepotvrđeno";

    @Setter
    @Size(max = 500)
    private String napomena;

    public void setStanje(String stanje) {
        if(RadnjaStatus.exists(stanje)) this.stanje = stanje;
    }
}
