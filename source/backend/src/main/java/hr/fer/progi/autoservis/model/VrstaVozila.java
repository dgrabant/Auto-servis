package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

@Entity
@Table(name="vrstavozila")
public class VrstaVozila {
    @Id
    @Column(name="idVrsta")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVrsta;

    @Column(name="nazivModela", nullable = false, length = 50)
    private String nazivModela;

    @Column(name="opisVrste", nullable = false, length = 100)
    private String opisVrste;

    public Integer getIdVrsta() {
        return idVrsta;
    }

    public String getNazivModela() {
        return nazivModela;
    }
    public void setNazivModela(String nazivModela) {
        if(nazivModela==null) return;
        if(nazivModela.isEmpty() || nazivModela.length()>50) throw new RuntimeException();
        else this.nazivModela = nazivModela;
    }

    public String getOpisVrste() {
        return opisVrste;
    }
    public void setOpisVrste(String opisVrste) {
        if(opisVrste.length()>100) throw new RuntimeException();
        else this.opisVrste = opisVrste;
    }
}
