package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

@Entity
@Table(name="dijeloviusluge")
public class Dijeloviusluge {
    @Id
    @Column(name="idDijelausluge")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDijelausluge;

    @Column(name="vrsta", nullable = false, length = 10)
    private String vrsta;

    @Column(name="naziv", nullable = false, length = 50)
    private String naziv;

    @Column(name="cijena")
    private Double cijena;

    @Column(name="opis", length = 500)
    private String opis = "";

    @Column(name="slikaUrl", length = 200)
    private String slikaUrl = "";

    public Integer getIdDijelausluge() {
        return idDijelausluge;
    }

    public String getNaziv() {
        return naziv;
    }
    public void setNaziv(String naziv) {
        if(naziv==null) return;
        if(naziv.isEmpty() || naziv.length()>50) throw new RuntimeException();
        else this.naziv = naziv;
    }

    public String getVrsta() {
        return vrsta;
    }

    public void setVrsta(String vrsta) {
        if(vrsta == null) return;
        if(vrsta.isEmpty() || vrsta.length()>10) throw new RuntimeException();
        this.vrsta = vrsta;
    }

    public Double getCijena() {
        return cijena;
    }
    public void setCijena(Double cijena) {
        this.cijena = cijena;
    }

    public String getOpis() {
        return opis;
    }
    public void setOpis(String opis) {
        if(opis.length()>500) throw new RuntimeException();
        else this.opis = opis;
    }

    public String getSlikaUrl() {
        return slikaUrl;
    }
    public void setSlikaUrl(String slikaUrl) {
        if(slikaUrl.length()>200) throw new RuntimeException();
        else this.slikaUrl = slikaUrl;
    }
}
