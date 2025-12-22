package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

import java.time.ZonedDateTime;

@Entity
@Table(name="termin", uniqueConstraints = @UniqueConstraint(columnNames = {"idKorisnik","datumVrijeme"}))
public class Termin {
    @Id
    @Column(name="idTermin")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTermin;

    @ManyToOne
    @JoinColumn(name="idKorisnik", referencedColumnName = "idKorisnik", nullable = false)
    private Korisnik korisnik;

    @Column(name="datumVrijeme", nullable = false)
    private ZonedDateTime datumVrijeme;

    @Column
    private ZonedDateTime odgoda;

    public Integer getIdTermin() {
        return idTermin;
    }

    public void setIdTermin(Integer idTermin) {
        this.idTermin = idTermin;
    }

    public Korisnik getKorisnik() {
        return korisnik;
    }

    public void setKorisnik(Korisnik korisnik) {
        if(korisnik==null) return;
        this.korisnik = korisnik;
    }

    public ZonedDateTime getDatumVrijeme() {
        return datumVrijeme;
    }

    public void setDatumVrijeme(ZonedDateTime datumVrijeme) {
        if(datumVrijeme==null) return;
        this.datumVrijeme = datumVrijeme;
    }

    public ZonedDateTime getOdgoda() {
        return odgoda;
    }

    public void setOdgoda(ZonedDateTime odgoda) {
        this.odgoda = odgoda;
    }
}
