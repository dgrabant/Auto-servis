package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.dto.RadnjaCreateDto;
import hr.fer.progi.autoservis.service.RadnjaStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Entity
@NoArgsConstructor
@Table(name="radnja", uniqueConstraints = @UniqueConstraint(columnNames = {"idPopravak","idDijelausluge"}))
public class Radnja {
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRadnja;

    @Setter
    @ManyToOne
    @JoinColumn(name="idPopravak", referencedColumnName = "idPopravak", nullable = false)
    @NotNull
    private Popravak popravak;

    @Setter
    @ManyToOne
    @JoinColumn(name="idKorisnik", referencedColumnName = "idKorisnik", nullable = false)
    @NotNull
    private Korisnik korisnik;

    @Setter
    @ManyToOne
    @JoinColumn(name="idDijelausluge", referencedColumnName = "idDijelausluge")
    private Dijeloviusluge dijeloviusluge;

    @Column(name="stanje", nullable = false, length = 20)
    @NotNull
    @Size(max = 20)
    private String stanje = "nepotvrđeno";

    @Setter
    @Column(length = 500)
    @Size(max = 500)
    private String napomena;

    public void setStanje(String stanje) {
        if(RadnjaStatus.exists(stanje)) this.stanje = stanje;
    }

    public Radnja(RadnjaCreateDto radnjaCreateDto){
        this.stanje = radnjaCreateDto.getStanje();
        this.napomena = radnjaCreateDto.getNapomena();
    }
}
