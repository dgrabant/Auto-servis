package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Vozilo;
import hr.fer.progi.autoservis.repository.VoziloRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vozilo")
public class VoziloController {

    // TODO: Potrebno je napraviti da korisnik može mijenjati samo svoje vozilo

    private final VoziloRepository voziloRepository;

    public VoziloController(VoziloRepository voziloRepository) {
        this.voziloRepository = voziloRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public List<Vozilo> getAllVehicles() {
        return voziloRepository.findAll();
    }

    // TODO: POTREBNO POVEZATI 1) KORISNIKA 2) VRSTU VOZILA
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Vozilo> getVehicleById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return voziloRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // TODO: POTREBNO POVEZATI 1) KORISNIKA 2) VRSTU VOZILA
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Vozilo createVehicle(@RequestBody Vozilo newVozilo) {
        return voziloRepository.save(newVozilo);
    }

    // TODO: POTREBNO POVEZATI 1) KORISNIKA 2) VRSTU VOZILA
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Vozilo> updateVehicle(@PathVariable Integer id, @RequestBody Vozilo updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return voziloRepository.findById(id)
                .map(existing -> {
                    existing.setKorisnik(updated.getKorisnik());
                    existing.setVrstaVozila(updated.getVrstaVozila());
                    existing.setRegOznaka(updated.getRegOznaka());
                    existing.setGodinaProizvodnje(updated.getGodinaProizvodnje());
                    existing.setSerijskiBr(updated.getSerijskiBr());
                    existing.setJeZamjensko(updated.getJeZamjensko());
                    return ResponseEntity.ok(voziloRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // TODO: POTREBNO POVEZATI 1) KORISNIKA 2) VRSTU VOZILA
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        if (!voziloRepository.existsById(id)) return ResponseEntity.notFound().build();
        voziloRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}