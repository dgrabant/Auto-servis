package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.dto.DijeloviuslugeCreateDto;
import hr.fer.progi.autoservis.dto.DijeloviuslugeUpdateDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Entity
@NoArgsConstructor
@Table(name="dijeloviusluge")
public class Dijeloviusluge {
    @Id
    @Column(name="idDijelausluge")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idDijelausluge;

    @Setter
    @Column(name="vrsta", nullable = false, length = 10)
    @NotNull
    @Size(max = 10)
    private String vrsta;

    @Setter
    @Column(name="naziv", nullable = false, length = 50)
    @NotNull
    @Size(max = 50)
    private String naziv;

    @Setter
    @Column(name="cijena")
    private Double cijena;

    @Setter
    @Column(name="opis", length = 500)
    @Size(max = 500)
    private String opis = "";

    @Setter
    @Column(name="slikaUrl", length = 200)
    @Size(max = 200)
    private String slikaUrl = "";

    public Dijeloviusluge(DijeloviuslugeCreateDto dijeloviuslugeDto) {
        this.vrsta = dijeloviuslugeDto.getVrsta();
        this.naziv = dijeloviuslugeDto.getNaziv();
        this.cijena = dijeloviuslugeDto.getCijena();
        this.opis = dijeloviuslugeDto.getOpis();
        this.slikaUrl = dijeloviuslugeDto.getSlikaUrl();
    }

}
