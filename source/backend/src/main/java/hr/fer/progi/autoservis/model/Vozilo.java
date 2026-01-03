package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.dto.VoziloCreateDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Entity
@NoArgsConstructor
@Table(name="vozilo")
public class Vozilo {
    @Id
    @Column(name="idVozila")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVozila;

    @Setter
    @ManyToOne
    @JoinColumn(name="idKorisnik",referencedColumnName="idKorisnik")
    private Korisnik korisnik;

    @Setter
    @ManyToOne
    @JoinColumn(name="idVrsta",referencedColumnName="idVrsta", nullable = false)
    @NotNull
    private VrstaVozila vrstaVozila;

    @Setter
    @Column(name="regOznaka", nullable = false, length = 10, unique = true)
    @NotNull
    @Size(max = 10)
    private String regOznaka;

    @Setter
    @Column(name="godinaProizvodnje")
    private Short godinaProizvodnje;

    @Setter
    @Column(name="serijskiBroj", length = 100)
    @Size(max = 100)
    private String serijskiBroj;

    @Setter
    @Column(name="jeZamjensko", nullable = false)
    @NotNull
    private Boolean jeZamjensko = false;

    public Vozilo(VoziloCreateDto voziloCreateDto){
        this.regOznaka = voziloCreateDto.getRegOznaka();
        this.godinaProizvodnje = voziloCreateDto.getGodinaProizvodnje();
        this.serijskiBroj = voziloCreateDto.getSerijskiBroj();
        this.jeZamjensko = voziloCreateDto.getJeZamjensko();
    }
}
