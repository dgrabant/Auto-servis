package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DijeloviuslugeUpdateDto {
    @Size(max = 10)
    private String vrsta;

    @Size(max = 50)
    private String naziv;

    private Double cijena;

    @Size(max = 500)
    private String opis = "";

    @Size(max = 200)
    private String slikaUrl = "";

    private String base64 = "";
}
