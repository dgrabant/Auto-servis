package hr.fer.progi.autoservis.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VrstavozilaCreateDto {
    @NotNull
    @Size(max = 50)
    private String nazivModela;

    @NotNull
    @Size(max = 100)
    private String opisVrste = "";
}
