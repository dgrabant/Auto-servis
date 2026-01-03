package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DijeloviuslugeCreateDto {
    @NotNull
    @Size(max = 10)
    private String vrsta;

    @NotNull
    @Size(max = 50)
    private String naziv;

    private Double cijena;

    @Size(max = 500)
    private String opis = "";

    @Size(max = 200)
    private String slikaUrl = "";

}
