package hr.fer.progi.autoservis.dto;

import hr.fer.progi.autoservis.service.KorisnikUloga;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
public class KorisnikUpdateDto {
    @Setter
    @Size(max = 50)
    private String ime;

    @Setter
    @Size(max = 50)
    private String prezime;

    @Setter
    @Size(max = 100)
    private String email;

    @Setter
    @Size(max = 20)
    private String davateljUsluge = "unknown";

    @Size(max = 20)
    private String uloga;

    public void setUloga(String uloga) {
        if(KorisnikUloga.exists(uloga)) this.uloga = uloga;
    }
}
