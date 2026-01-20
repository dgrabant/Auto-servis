package hr.fer.progi.autoservis.dto;

import hr.fer.progi.autoservis.service.PopravakStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
public class PopravakUpdateDto {
    @Setter
    private Integer idVozila;

    @Setter
    private Integer idTermin;

    @Size(max = 20)
    private String stanje = "u pripremi";

    @Setter
    private String datumVrijeme;

    @Setter
    @Size(max = 500)
    private String opis;

    public void setStanje(String stanje) {
        if(PopravakStatus.exists(stanje)) this.stanje = stanje;
    }
}
