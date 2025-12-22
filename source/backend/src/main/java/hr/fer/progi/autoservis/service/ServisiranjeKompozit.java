package hr.fer.progi.autoservis.service;

import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.model.Popravak;

import java.io.Serializable;
import java.util.Objects;

public class ServisiranjeKompozit implements Serializable {
    private Popravak popravak;
    private Korisnik korisnik;

    public ServisiranjeKompozit() {
    }

    public ServisiranjeKompozit(Popravak popravak, Korisnik korisnik) {
        this.popravak = popravak;
        this.korisnik = korisnik;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServisiranjeKompozit that = (ServisiranjeKompozit) o;
        return Objects.equals(popravak, that.popravak) && Objects.equals(korisnik, that.korisnik);
    }

    @Override
    public int hashCode() {
        return Objects.hash(popravak, korisnik);
    }
}
