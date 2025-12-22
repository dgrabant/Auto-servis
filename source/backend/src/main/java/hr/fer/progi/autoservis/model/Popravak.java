package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.service.PopravakStatus;
import jakarta.persistence.*;

import java.util.Arrays;
import java.util.List;

@Entity
@Table(name="popravak")
public class Popravak {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPopravak;

    @ManyToOne
    @JoinColumn(name="idVozilo", referencedColumnName = "idVozilo", nullable = false)
    private Vozilo vozilo;

    @OneToOne
    @JoinColumn(name="idTermin", referencedColumnName = "idTermin", nullable = false, unique = true)
    private Termin termin;

    @Column(name="stanje", length = 10, nullable = false)
    private String stanje = "u pripremi";

    public Integer getIdPopravak() {
        return idPopravak;
    }

    public void setIdPopravak(Integer idPopravak) {
        this.idPopravak = idPopravak;
    }

    public Vozilo getVozilo() {
        return vozilo;
    }

    public void setVozilo(Vozilo vozilo) {
        if(vozilo == null) return;
        this.vozilo = vozilo;
    }

    public Termin getTermin() {
        return termin;
    }

    public void setTermin(Termin termin) {
        if(termin == null) return;
        this.termin = termin;
    }

    public PopravakStatus getStanje() {
        PopravakStatus status;

        try{
            status = PopravakStatus.valueOf(this.stanje);
        }
        catch (Exception e){
            throw new RuntimeException();
        }

        return status;
    }

    public void setStanje(PopravakStatus status) {
        if(stanje==null) return;

        List<String> values = Arrays.stream(PopravakStatus.values()).map(PopravakStatus::getValue).toList();
        String strStatus = status.getValue();

        if(values.contains(strStatus)){
            this.stanje = strStatus;
        } else throw new RuntimeException();
    }
}
