package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.VrstaVozila;
import hr.fer.progi.autoservis.repository.VrstaVozilaRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import hr.fer.progi.autoservis.service.AuthorityCheck;

import java.util.List;

@RestController
@RequestMapping("/api/vrstavozila")
public class VrstaVozilaController {
    private final VrstaVozilaRepository vrstaVozilaRepository;

    public VrstaVozilaController(VrstaVozilaRepository vrstaVozilaRepository) {
        this.vrstaVozilaRepository = vrstaVozilaRepository;
    }

    @GetMapping
    public ResponseEntity<List<VrstaVozila>> getAllVehicleTypes(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<VrstaVozila> vehicleTypes = vrstaVozilaRepository.findAll();
        return ResponseEntity.ok(vehicleTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VrstaVozila> getVehicleTypeById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return vrstaVozilaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VrstaVozila> createVehicleType(@RequestBody VrstaVozila newVrsta, @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(vrstaVozilaRepository.save(newVrsta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VrstaVozila> updateVehicleType(@PathVariable Integer id, @RequestBody VrstaVozila updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

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

        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (!vrstaVozilaRepository.existsById(id)) return ResponseEntity.notFound().build();

        boolean success = false;
        try{
            vrstaVozilaRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
