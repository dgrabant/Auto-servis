package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.dto.KorisnikCreateDto;
import hr.fer.progi.autoservis.service.KorisnikUloga;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Entity
@NoArgsConstructor
@Table(name="korisnik")
public class Korisnik {
    @Id
    @Column(name="idKorisnik")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idKorisnik;

    @Setter
    @Column(nullable = false, length = 50)
    @NotNull
    @Size(max = 50)
    private String ime;

    @Setter
    @Column(nullable = false, length = 50)
    @NotNull
    @Size(max = 50)
    private String prezime;

    @Setter
    @Column(nullable = false, unique = true, length = 100)
    @NotNull
    @Size(max = 100)
    private String email;

    @Setter
    @Column(name="davateljUsluge", nullable = false, length = 20)
    @NotNull
    @Size(max = 20)
    private String davateljUsluge = "unknown";

    @Column(nullable = false, length = 20)
    @NotNull
    @Size(max = 20)
    private String uloga;

    public Korisnik(KorisnikCreateDto korisnikDto){
        this.ime = korisnikDto.getIme();
        this.prezime = korisnikDto.getPrezime();
        this.email = korisnikDto.getEmail();
        this.davateljUsluge = korisnikDto.getDavateljUsluge();
        this.uloga = korisnikDto.getUloga();
    }

    public void setUloga(String uloga) {
        if(KorisnikUloga.exists(uloga)) this.uloga = uloga;
    }
}
