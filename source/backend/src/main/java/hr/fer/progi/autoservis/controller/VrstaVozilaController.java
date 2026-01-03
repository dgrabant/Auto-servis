package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.VrstavozilaCreateDto;
import hr.fer.progi.autoservis.dto.VrstavozilaUpdateDto;
import hr.fer.progi.autoservis.model.VrstaVozila;
import hr.fer.progi.autoservis.repository.VrstaVozilaRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import hr.fer.progi.autoservis.service.AuthorityCheck;

import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<VrstaVozila> createVehicleType(@Valid @RequestBody VrstavozilaCreateDto vrstavozilaDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            return ResponseEntity.ok(vrstaVozilaRepository.save(new VrstaVozila(vrstavozilaDto)));
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<VrstaVozila> updateVehicleType(@PathVariable Integer id, @RequestBody VrstavozilaUpdateDto vrstavozilaDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(vrstavozilaDto.getNazivModela() == null && vrstavozilaDto.getOpisVrste() == null) return ResponseEntity.badRequest().build();

        Optional<VrstaVozila> existing = vrstaVozilaRepository.findById(id);
        if(existing.isPresent()){
            if(vrstavozilaDto.getNazivModela() != null) existing.get().setNazivModela(vrstavozilaDto.getNazivModela());
            if(vrstavozilaDto.getOpisVrste() != null) existing.get().setOpisVrste(vrstavozilaDto.getOpisVrste());

            try {
                return ResponseEntity.ok(vrstaVozilaRepository.save(existing.get()));
            }
            catch (Exception e){
                return ResponseEntity.internalServerError().build();
            }
        }
        else return ResponseEntity.badRequest().build();
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
