package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.VrstaVozila;
import hr.fer.progi.autoservis.repository.VrstaVozilaRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/vrstavozila")
public class VrstaVozilaController {
    private final VrstaVozilaRepository vrstaVozilaRepository;

    public VrstaVozilaController(VrstaVozilaRepository vrstaVozilaRepository) {
        this.vrstaVozilaRepository = vrstaVozilaRepository;
    }

    @GetMapping
    public ResponseEntity<List<VrstaVozila>> getAllVehicleTypes(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        List<VrstaVozila> vehicleTypes = vrstaVozilaRepository.findAll();
        return ResponseEntity.ok(vehicleTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VrstaVozila> getVehicleTypeById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        return vrstaVozilaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VrstaVozila> createVehicleType(@RequestBody VrstaVozila newVrsta, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();

        return ResponseEntity.ok(vrstaVozilaRepository.save(newVrsta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VrstaVozila> updateVehicleType(@PathVariable Integer id, @RequestBody VrstaVozila updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        return vrstaVozilaRepository.findById(id)
                .map(existing -> {
                    existing.setNazivModela(updated.getNazivModela());
                    existing.setOpisVrste(updated.getOpisVrste());
                    return ResponseEntity.ok(vrstaVozilaRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicleType(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        if (!vrstaVozilaRepository.existsById(id)) return ResponseEntity.notFound().build();

        boolean success = false;
        try{
            vrstaVozilaRepository.deleteById(id);
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
