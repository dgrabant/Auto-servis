package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.service.ServisiranjeKompozit;
import jakarta.persistence.*;

@Entity
@IdClass(ServisiranjeKompozit.class)
@Table(name="servisiranje", uniqueConstraints = @UniqueConstraint(columnNames = {"idPopravak","idKorisnik"}))
public class Servisiranje {
    @Id
    @ManyToOne
    @JoinColumn(name="idPopravak", referencedColumnName = "idPopravak")
    private Popravak popravak;

    @Id
    @ManyToOne
    @JoinColumn(name="idKorisnik", referencedColumnName = "idKorisnik")
    private Korisnik korisnik;

    public Popravak getPopravak() {
        return popravak;
    }

    public void setPopravak(Popravak popravak) {
        if(popravak == null) return;
        this.popravak = popravak;
    }

    public Korisnik getKorisnik() {
        return korisnik;
    }

    public void setKorisnik(Korisnik korisnik) {
        if(korisnik == null) return;
        this.korisnik = korisnik;
    }
}
