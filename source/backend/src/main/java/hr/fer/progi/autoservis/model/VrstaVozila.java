package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.dto.VrstavozilaCreateDto;
import hr.fer.progi.autoservis.dto.VrstavozilaUpdateDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Entity
@NoArgsConstructor
@Table(name="vrstavozila")
public class VrstaVozila {
    @Id
    @Column(name="idVrsta")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVrsta;

    @Setter
    @Column(name="nazivModela", nullable = false, length = 50)
    @NotNull
    @Size(max = 50)
    private String nazivModela;

    @Setter
    @Column(name="opisVrste", nullable = false, length = 100)
    @NotNull
    @Size(max = 100)
    private String opisVrste = "";

    public VrstaVozila(VrstavozilaCreateDto vrstavozilaCreateDto){
        this.nazivModela = vrstavozilaCreateDto.getNazivModela();
        this.opisVrste = vrstavozilaCreateDto.getOpisVrste();
    }
}
