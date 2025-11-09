package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

@Entity
@Table(name="usluga")
public class Usluga {
    @Id
    @Column(name="idUsluge")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsluge;

    @Column(name="naziv", nullable = false, length = 50)
    private String naziv;

    @Column(name="cijena", nullable = false)
    private Double cijena;

    @Column(name="opis", nullable = false, length = 500)
    private String opis;

    @Column(name="slikaUrl", nullable = false, length = 200)
    private String slikaUrl;

    public Integer getIdUsluge() {
        return idUsluge;
    }

    public String getNaziv() {
        return naziv;
    }
    public void setNaziv(String naziv) {
        if(naziv==null) return;
        if(naziv.isEmpty() || naziv.length()>50) throw new RuntimeException();
        else this.naziv = naziv;
    }

    public Double getCijena() {
        return cijena;
    }
    public void setCijena(Double cijena) {
        if(cijena==null) return;
        this.cijena = cijena;
    }

    public String getOpis() {
        return opis;
    }
    public void setOpis(String opis) {
        if(opis==null) return;
        if(opis.length()>500) throw new RuntimeException();
        else this.opis = opis;
    }

    public String getSlikaUrl() {
        return slikaUrl;
    }
    public void setSlikaUrl(String slikaUrl) {
        if(slikaUrl==null) return;
        if(slikaUrl.length()>200) throw new RuntimeException();
        else this.slikaUrl = slikaUrl;
    }
}
