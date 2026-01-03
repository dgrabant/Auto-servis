package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.dto.PopravakCreateDto;
import hr.fer.progi.autoservis.service.PopravakStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Entity
@NoArgsConstructor
@Table(name="popravak")
public class Popravak {
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idPopravak;

    @Setter
    @ManyToOne
    @JoinColumn(name="idVozila", referencedColumnName = "idVozila", nullable = false)
    @NotNull
    private Vozilo vozilo;

    @Setter
    @OneToOne
    @JoinColumn(name="idTermin", referencedColumnName = "idTermin", nullable = false, unique = true)
    @NotNull
    private Termin termin;

    @Column(name="stanje", nullable = false, length = 20)
    @NotNull
    @Size(max = 20)
    private String stanje = "u pripremi";

    public Popravak(PopravakCreateDto popravakDto){
        this.stanje = popravakDto.getStanje();
    }

    public void setStanje(String stanje) {
        if(PopravakStatus.exists(stanje)) this.stanje = stanje;
    }
}
