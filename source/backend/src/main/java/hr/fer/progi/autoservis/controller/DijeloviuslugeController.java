package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.DijeloviuslugeCreateDto;
import hr.fer.progi.autoservis.dto.DijeloviuslugeUpdateDto;
import hr.fer.progi.autoservis.model.Dijeloviusluge;
import hr.fer.progi.autoservis.repository.DijeloviuslugeRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import hr.fer.progi.autoservis.service.ImageUpload;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dijeloviusluge")
public class DijeloviuslugeController {

    private final DijeloviuslugeRepository dijeloviuslugeRepository;
    private final ImageUpload imageUpload;

    public DijeloviuslugeController(DijeloviuslugeRepository dijeloviRepository, ImageUpload imageUpload){
        this.dijeloviuslugeRepository = dijeloviRepository;
        this.imageUpload = imageUpload;
    }

    @GetMapping
    public List<Dijeloviusluge> getAll(){
        return dijeloviuslugeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dijeloviusluge> getById(@PathVariable Integer id){
        return dijeloviuslugeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping
    public ResponseEntity<Dijeloviusluge> create(@Valid @RequestBody DijeloviuslugeCreateDto dijeloviuslugeDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(dijeloviuslugeDto.getBase64() != null){
            String rawImage = dijeloviuslugeDto.getBase64();
            if(!rawImage.isEmpty()){
                String imgUrl = imageUpload.SendRequest(rawImage.split(",")[1]);

                if(imgUrl.isEmpty()){
                    return ResponseEntity.internalServerError().build();
                }

                dijeloviuslugeDto.setSlikaUrl(imgUrl);
            }
        }

        try {
            return ResponseEntity.ok(dijeloviuslugeRepository.save(new Dijeloviusluge(dijeloviuslugeDto)));
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dijeloviusluge> update(@PathVariable Integer id, @Valid @RequestBody DijeloviuslugeUpdateDto dijeloviuslugeDto, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Dijeloviusluge> existing = dijeloviuslugeRepository.findById(id);
        if(existing.isPresent()){
            if(dijeloviuslugeDto.getVrsta() != null) existing.get().setVrsta(dijeloviuslugeDto.getVrsta());
            if(dijeloviuslugeDto.getNaziv() != null) existing.get().setNaziv(dijeloviuslugeDto.getNaziv());
            if(dijeloviuslugeDto.getCijena() != null) existing.get().setCijena(dijeloviuslugeDto.getCijena());
            if(dijeloviuslugeDto.getOpis() != null) existing.get().setOpis(dijeloviuslugeDto.getOpis());
            if(dijeloviuslugeDto.getSlikaUrl() != null) existing.get().setSlikaUrl(dijeloviuslugeDto.getSlikaUrl());

            if(dijeloviuslugeDto.getBase64() != null){
                String rawImage = dijeloviuslugeDto.getBase64();
                if(!rawImage.isEmpty()){
                    String imgUrl = imageUpload.SendRequest(rawImage.split(",")[1]);

                    if(imgUrl.isEmpty()){
                        return ResponseEntity.internalServerError().build();
                    }

                    existing.get().setSlikaUrl(imgUrl);
                }
            }

            try {
                return ResponseEntity.ok(dijeloviuslugeRepository.save(existing.get()));
            }
            catch (Exception e){
                return ResponseEntity.internalServerError().build();
            }
        }
        else return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (!dijeloviuslugeRepository.existsById(id)) return ResponseEntity.badRequest().build();

        boolean success = false;
        try{
            dijeloviuslugeRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
