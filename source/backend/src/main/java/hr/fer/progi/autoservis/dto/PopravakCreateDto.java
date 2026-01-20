package hr.fer.progi.autoservis.dto;

import hr.fer.progi.autoservis.service.PopravakStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
public class PopravakCreateDto {
    @Setter
    @NotNull
    private Integer idVozila;

    @Setter
    @NotNull
    private Integer idTermin;

    @NotNull
    @Size(max = 20)
    private String stanje = "u pripremi";

    @Setter
    private String datumVrijeme;

    @Setter
    @Size(max = 1000)
    private String opis = "";

    public void setStanje(String stanje) {
        if(PopravakStatus.exists(stanje)) this.stanje = stanje;
    }
}
