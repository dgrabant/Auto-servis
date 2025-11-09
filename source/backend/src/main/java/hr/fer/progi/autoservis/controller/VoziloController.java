package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Vozilo;
import hr.fer.progi.autoservis.repository.VoziloRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/vozilo")
public class VoziloController {

    // TODO: Potrebno je napraviti da korisnik može mijenjati samo svoje vozilo

    private final VoziloRepository voziloRepository;

    public VoziloController(VoziloRepository voziloRepository) {
        this.voziloRepository = voziloRepository;
    }

    @GetMapping
    public ResponseEntity<List<Vozilo>> getAllVehicles(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal, "RADNIK") && !CheckAuthority(userPrincipal, "UPRAVITELJ") && !CheckAuthority(userPrincipal, "ADMIN"))
            return ResponseEntity.status(401).build();
        List<Vozilo> vehicles = voziloRepository.findAll();
        return ResponseEntity.ok(vehicles);
    }

    // TODO: POTREBNO POVEZATI 1) KORISNIKA 2) VRSTU VOZILA
    @GetMapping("/{id}")
    public ResponseEntity<Vozilo> getVehicleById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();

        Optional<Vozilo> vehicle = voziloRepository.findById(id);
        if(CheckAuthority(userPrincipal, "KORISNIK")){
            if(vehicle.isPresent() && Objects.equals(vehicle.get().getKorisnik().getIdKorisnik(), userPrincipal.getId())){
                return ResponseEntity.ok(vehicle.get());
            }
            else return ResponseEntity.status(401).build();
        }
        else return voziloRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // TODO: POTREBNO POVEZATI 1) KORISNIKA 2) VRSTU VOZILA
    @PostMapping
    public ResponseEntity<Vozilo> createVehicle(@RequestBody Vozilo newVozilo, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(voziloRepository.save(newVozilo));
    }

    // TODO: POTREBNO POVEZATI 1) KORISNIKA 2) VRSTU VOZILA
    @PutMapping("/{id}")
    public ResponseEntity<Vozilo> updateVehicle(@PathVariable Integer id, @RequestBody Vozilo updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();
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
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();
        if (!voziloRepository.existsById(id)) return ResponseEntity.notFound().build();

        boolean success = false;
        try{
            voziloRepository.deleteById(id);
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