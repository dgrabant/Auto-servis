package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.dto.ServisiranjeDto;
import hr.fer.progi.autoservis.service.ServisiranjeKompozit;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Entity
@NoArgsConstructor
@IdClass(ServisiranjeKompozit.class)
@Table(name="servisiranje", uniqueConstraints = @UniqueConstraint(columnNames = {"idPopravak","idKorisnik"}))
public class Servisiranje {
    @Id
    @ManyToOne
    @JoinColumn(name="idPopravak", referencedColumnName = "idPopravak", nullable = false)
    @NotNull
    private Popravak popravak;

    @Id
    @ManyToOne
    @JoinColumn(name="idKorisnik", referencedColumnName = "idKorisnik", nullable = false)
    @NotNull
    private Korisnik korisnik;

    public Servisiranje(Popravak popravak, Korisnik korisnik){
        this.popravak = popravak;
        this.korisnik = korisnik;
    }
}
