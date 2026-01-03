package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;

@Setter
@Getter
@Entity
@Table(name="termin", uniqueConstraints = @UniqueConstraint(columnNames = {"idKorisnik","datumVrijeme"}))
public class Termin {
    @Id
    @Column(name="idTermin")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTermin;

    @ManyToOne
    @JoinColumn(name="idKorisnik", referencedColumnName = "idKorisnik", nullable = false)
    @NotNull
    private Korisnik korisnik;

    @Column(name="datumVrijeme", nullable = false)
    @NotNull
    private ZonedDateTime datumVrijeme;

    @Column
    private ZonedDateTime odgoda;
}
