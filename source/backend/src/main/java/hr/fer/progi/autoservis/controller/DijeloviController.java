package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Dijelovi;
import hr.fer.progi.autoservis.repository.DijeloviRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dijelovi")
public class DijeloviController {

    private final DijeloviRepository dijeloviRepository;

    public DijeloviController(DijeloviRepository dijeloviRepository){
        this.dijeloviRepository = dijeloviRepository;
    }

    @GetMapping("")
    public List<Dijelovi> getAllParts(){
        return dijeloviRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dijelovi> getPartById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return dijeloviRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public Dijelovi createPart(@RequestBody Dijelovi newPart) {
        return dijeloviRepository.save(newPart);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public ResponseEntity<Dijelovi> updatePart(@PathVariable Integer id, @RequestBody Dijelovi updated, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return dijeloviRepository.findById(id)
                .map(existing -> {
                    existing.setNaziv(updated.getNaziv());
                    existing.setCijena(updated.getCijena());
                    existing.setOpis(updated.getOpis());
                    existing.setSlikaUrl(updated.getSlikaUrl());
                    return ResponseEntity.ok(dijeloviRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public ResponseEntity<Void> deletePart(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        if (!dijeloviRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        dijeloviRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
