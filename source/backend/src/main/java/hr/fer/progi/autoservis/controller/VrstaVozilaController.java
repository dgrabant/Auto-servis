package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.VrstaVozila;
import hr.fer.progi.autoservis.repository.VrstaVozilaRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vrstavozila")
public class VrstaVozilaController {
    private final VrstaVozilaRepository vrstaVozilaRepository;

    public VrstaVozilaController(VrstaVozilaRepository vrstaVozilaRepository) {
        this.vrstaVozilaRepository = vrstaVozilaRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public List<VrstaVozila> getAllVehicleTypes() {
        return vrstaVozilaRepository.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public ResponseEntity<VrstaVozila> getVehicleTypeById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return vrstaVozilaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('UPRAVITELJ','ADMIN')")
    public VrstaVozila createVehicleType(@RequestBody VrstaVozila newVrsta) {
        return vrstaVozilaRepository.save(newVrsta);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('UPRAVITELJ','ADMIN')")
    public ResponseEntity<VrstaVozila> updateVehicleType(@PathVariable Integer id, @RequestBody VrstaVozila updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return vrstaVozilaRepository.findById(id)
                .map(existing -> {
                    existing.setNazivMarke(updated.getNazivMarke());
                    existing.setOpisVrste(updated.getOpisVrste());
                    return ResponseEntity.ok(vrstaVozilaRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('UPRAVITELJ','ADMIN')")
    public ResponseEntity<Void> deleteVehicleType(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        if (!vrstaVozilaRepository.existsById(id)) return ResponseEntity.notFound().build();
        vrstaVozilaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
