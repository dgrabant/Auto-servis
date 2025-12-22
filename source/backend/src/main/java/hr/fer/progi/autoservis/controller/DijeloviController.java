package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Dijeloviusluge;
import hr.fer.progi.autoservis.repository.DijeloviuslugeRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dijelovi")
public class DijeloviController {
    private final DijeloviuslugeRepository dijeloviuslugeRepository;

    public DijeloviController(DijeloviuslugeRepository dijeloviRepository){
        this.dijeloviuslugeRepository = dijeloviRepository;
    }

    @GetMapping
    public List<Dijeloviusluge> getAll(){
        return dijeloviuslugeRepository.findAll().stream().filter(du -> du.getVrsta().equalsIgnoreCase("dio")).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dijeloviusluge> getById(@PathVariable Integer id){
        return dijeloviuslugeRepository.findById(id)
                .filter(du -> du.getVrsta().equals("dio"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Dijeloviusluge> create(@RequestBody Dijeloviusluge newPart, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(!newPart.getVrsta().equalsIgnoreCase("dio")) return ResponseEntity.badRequest().build();

        return ResponseEntity.ok(dijeloviuslugeRepository.save(newPart));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dijeloviusluge> update(@PathVariable Integer id, @RequestBody Dijeloviusluge updated, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(!updated.getVrsta().equalsIgnoreCase("dio")) return ResponseEntity.badRequest().build();

        return dijeloviuslugeRepository.findById(id)
                .filter(du -> du.getVrsta().equalsIgnoreCase("dio"))
                .map(existing -> {
                    existing.setNaziv(updated.getNaziv());
                    existing.setCijena(updated.getCijena());
                    existing.setOpis(updated.getOpis());
                    existing.setSlikaUrl(updated.getSlikaUrl());
                    return ResponseEntity.ok(dijeloviuslugeRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (!dijeloviuslugeRepository.existsById(id)) return ResponseEntity.notFound().build();
        if(dijeloviuslugeRepository.findById(id).isPresent() && !dijeloviuslugeRepository.findById(id).get().getVrsta().equalsIgnoreCase("dio"))
            return ResponseEntity.badRequest().build();

        boolean success = false;
        try{
            dijeloviuslugeRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
