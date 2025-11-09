package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

@Entity
@Table(name="vrstavozila")
public class VrstaVozila {
    @Id
    @Column(name="idVrsta")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVrsta;

    @Column(name="nazivMarke", nullable = false, length = 50)
    private String nazivMarke;

    @Column(name="opisVrste", nullable = false, length = 100)
    private String opisVrste;

    public Integer getIdVrsta() {
        return idVrsta;
    }

    public String getNazivMarke() {
        return nazivMarke;
    }
    public void setNazivMarke(String nazivMarke) {
        if(nazivMarke.isEmpty() || nazivMarke.length()>50) throw new RuntimeException();
        else this.nazivMarke = nazivMarke;
    }

    public String getOpisVrste() {
        return opisVrste;
    }
    public void setOpisVrste(String opisVrste) {
        if(opisVrste.isEmpty() || opisVrste.length()>100) throw new RuntimeException();
        else this.opisVrste = opisVrste;
    }
}
