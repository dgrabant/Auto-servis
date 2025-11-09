package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Dijelovi;
import hr.fer.progi.autoservis.repository.DijeloviRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/dijelovi")
public class DijeloviController {

    private final DijeloviRepository dijeloviRepository;

    public DijeloviController(DijeloviRepository dijeloviRepository){
        this.dijeloviRepository = dijeloviRepository;
    }

    @GetMapping
    public List<Dijelovi> getAllParts(){
        return dijeloviRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dijelovi> getPartById(@PathVariable Integer id){
        return dijeloviRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Dijelovi> createPart(@RequestBody Dijelovi newPart, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(dijeloviRepository.save(newPart));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dijelovi> updatePart(@PathVariable Integer id, @RequestBody Dijelovi updated, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
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
    public ResponseEntity<Void> deletePart(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        if (!dijeloviRepository.existsById(id)) return ResponseEntity.notFound().build();

        boolean success = false;
        try{
            dijeloviRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }

    private boolean CheckAuthority(UserPrincipal userPrincipal){
        return (userPrincipal!=null);
    }

    private boolean CheckAuthority(UserPrincipal userPrincipal, String role){
        return (userPrincipal!=null && Objects.requireNonNull(userPrincipal.getAuthorities().stream().findFirst().orElse(null)).getAuthority().equals(role));
    }
}
