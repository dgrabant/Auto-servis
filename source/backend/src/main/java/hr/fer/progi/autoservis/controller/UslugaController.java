package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Usluga;
import hr.fer.progi.autoservis.repository.UslugaRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/usluga")
public class UslugaController {

    private final UslugaRepository uslugaRepository;

    public UslugaController(UslugaRepository uslugaRepository){
        this.uslugaRepository = uslugaRepository;
    }

    @GetMapping
    public List<Usluga> getAllServices() {
        return uslugaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usluga> getServiceById(@PathVariable Integer id) {
        return uslugaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Usluga> createService(@RequestBody Usluga newUsluga, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(uslugaRepository.save(newUsluga));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usluga> updateService(@PathVariable Integer id, @RequestBody Usluga updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        return uslugaRepository.findById(id)
                .map(existing -> {
                    existing.setNaziv(updated.getNaziv());
                    existing.setCijena(updated.getCijena());
                    existing.setOpis(updated.getOpis());
                    existing.setSlikaUrl(updated.getSlikaUrl());
                    return ResponseEntity.ok(uslugaRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        if (!uslugaRepository.existsById(id)) return ResponseEntity.notFound().build();

        boolean success = false;
        try{
            uslugaRepository.deleteById(id);
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
