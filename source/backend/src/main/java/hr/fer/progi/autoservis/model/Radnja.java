package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.service.RadnjaStatus;
import jakarta.persistence.*;

import java.util.Arrays;
import java.util.List;

@Entity
@Table(name="radnja", uniqueConstraints = @UniqueConstraint(columnNames = {"idPopravak","idDijelausluge"}))
public class Radnja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRadnja;

    @ManyToOne
    @JoinColumn(name="idPopravak", referencedColumnName = "idPopravak", nullable = false)
    private Popravak popravak;

    @ManyToOne
    @JoinColumn(name="idKorisnik", referencedColumnName = "idKorisnik", nullable = false)
    private Korisnik korisnik;

    @ManyToOne
    @JoinColumn(name="idDijelausluge", referencedColumnName = "idDijelausluge")
    private Dijeloviusluge dijeloviusluge;

    @Column(name="stanje", length = 10, nullable = false)
    private String stanje = "nepotvrđeno";

    @Column(length = 500)
    private String napomena;

    public Integer getIdRadnja() {
        return idRadnja;
    }

    public void setIdRadnja(Integer idRadnja) {
        this.idRadnja = idRadnja;
    }

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

    public Dijeloviusluge getDijeloviusluge() {
        return dijeloviusluge;
    }

    public void setDijeloviusluge(Dijeloviusluge dijeloviusluge) {
        this.dijeloviusluge = dijeloviusluge;
    }

    public RadnjaStatus getStanje() {
        RadnjaStatus status;

        try{
            status = RadnjaStatus.valueOf(this.stanje);
        }
        catch (Exception e){
            throw new RuntimeException();
        }

        return status;
    }

    public void setStanje(RadnjaStatus status) {
        if(stanje==null) return;

        List<String> values = Arrays.stream(RadnjaStatus.values()).map(RadnjaStatus::getValue).toList();
        String strStatus = status.getValue();

        if(values.contains(strStatus)){
            this.stanje = strStatus;
        } else throw new RuntimeException();
    }

    public String getNapomena() {
        return napomena;
    }

    public void setNapomena(String napomena) {
        this.napomena = napomena;
    }
}
