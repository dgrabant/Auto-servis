package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

@Entity
@Table(name="vozilo")
public class Vozilo {
    @Id
    @Column(name="idVozila")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVozila;

    @ManyToOne
    @JoinColumn(name="idKorisnik",referencedColumnName="idKorisnik")
    private Korisnik korisnik;

    @ManyToOne
    @JoinColumn(name="idVrsta",referencedColumnName="idVrsta", nullable = false)
    private VrstaVozila vrstaVozila;

    @Column(name="regOznaka", nullable = false, length = 10)
    private String regOznaka;

    @Column(name="godinaProizvodnje", nullable = false)
    private Short godinaProizvodnje;

    @Column(name="serijskiBr", nullable = false, length = 100)
    private String serijskiBr;

    @Column(name="jeZamjensko", nullable = false)
    private Boolean jeZamjensko;

    public Integer getIdVozila() {
        return idVozila;
    }

    public Korisnik getKorisnik() {
        return korisnik;
    }
    public void setKorisnik(Korisnik korisnik) {
        if(korisnik==null) return;
        this.korisnik = korisnik;
    }

    public VrstaVozila getVrstaVozila() {
        return vrstaVozila;
    }
    public void setVrstaVozila(VrstaVozila vrstaVozila) {
        if(vrstaVozila==null) return;
        this.vrstaVozila = vrstaVozila;
    }

    public String getRegOznaka() {
        return regOznaka;
    }
    public void setRegOznaka(String regOznaka) {
        if(regOznaka==null) return;
        if(regOznaka.isEmpty() || regOznaka.length()>10) throw new RuntimeException();
        else this.regOznaka = regOznaka;
    }

    public Short getGodinaProizvodnje() {
        return godinaProizvodnje;
    }
    public void setGodinaProizvodnje(Short godinaProizvodnje) {
        if(godinaProizvodnje==null) return;
        this.godinaProizvodnje = godinaProizvodnje;
    }

    public String getSerijskiBr() {
        return serijskiBr;
    }
    public void setSerijskiBr(String serijskiBr) {
        if(serijskiBr==null) return;
        if(serijskiBr.isEmpty() || serijskiBr.length()>100) throw new RuntimeException();
        else this.serijskiBr = serijskiBr;
    }

    public Boolean getJeZamjensko() {
        return jeZamjensko;
    }
    public void setJeZamjensko(Boolean jeZamjensko) {
        if(jeZamjensko==null) return;
        this.jeZamjensko = jeZamjensko;
    }
}
