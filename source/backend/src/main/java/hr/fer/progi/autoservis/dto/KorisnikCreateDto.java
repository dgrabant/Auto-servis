package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class KorisnikCreateDto {
    @NotNull
    @Size(max = 50)
    private String ime;

    @NotNull
    @Size(max = 50)
    private String prezime;

    @NotNull
    @Size(max = 100)
    private String email;

    @NotNull
    @Size(max = 20)
    private String davateljUsluge = "unknown";

    @NotNull
    @Size(max = 20)
    private String uloga;

}
