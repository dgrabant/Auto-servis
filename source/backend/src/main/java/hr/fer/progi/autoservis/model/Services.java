package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

@Entity
@Table(name="dijelovi")
public class Services {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idDijela;

    @Column(nullable = false, length = 50)
    private String naziv;

    @Column(nullable = false)
    private double cijena;

    @Column(nullable = false, length = 500)
    private String opis;

    @Column(nullable = false, length = 200)
    private String slikaUrl;

    public long getIdDijela() {
        return idDijela;
    }

    public String getNaziv() {
        return naziv;
    }

    public void setNaziv(String naziv) {
        if(naziv.isEmpty() || naziv.length()>50) throw new RuntimeException();
        else this.naziv = naziv;
    }

    public double getCijena() {
        return cijena;
    }

    public void setCijena(double cijena) {
        // Mozda provjera ispravne cijene?
        this.cijena = cijena;
    }

    public String getOpis() {
        return opis;
    }

    public void setOpis(String opis) {
        if(opis.isEmpty() || opis.length()>500) throw new RuntimeException();
        else this.opis = opis;
    }

    public String getSlikaUrl() {
        return slikaUrl;
    }

    public void setSlikaUrl(String slikaUrl) {
        if(slikaUrl.isEmpty() || slikaUrl.length()>200) throw new RuntimeException();
        else this.slikaUrl = slikaUrl;
    }
}
