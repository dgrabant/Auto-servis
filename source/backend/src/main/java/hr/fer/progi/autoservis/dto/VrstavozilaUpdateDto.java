package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VrstavozilaUpdateDto {
    @Size(max = 50)
    private String nazivModela;

    @Size(max = 100)
    private String opisVrste = "";
}
