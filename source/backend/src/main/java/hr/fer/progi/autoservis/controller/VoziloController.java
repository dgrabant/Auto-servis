package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Vozilo;
import hr.fer.progi.autoservis.repository.VoziloRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/vozilo")
public class VoziloController {

    private final VoziloRepository voziloRepository;

    public VoziloController(VoziloRepository voziloRepository) {
        this.voziloRepository = voziloRepository;
    }

    @GetMapping
    public ResponseEntity<List<Vozilo>> getAllVehicles(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Vozilo> vehicles;
        if(AuthorityCheck.CheckAuthority(userPrincipal, "korisnik")){
            List<Vozilo> temp = voziloRepository.findAll();
            List<Vozilo> finalVehicles = new ArrayList<>();
            Integer idKorisnik = userPrincipal.getId();
            temp.forEach(v -> {
                if(Objects.equals(v.getKorisnik().getIdKorisnik(), idKorisnik)){
                    finalVehicles.add(v);
                }
            });
            return ResponseEntity.ok(finalVehicles);
        }
        else if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        vehicles = voziloRepository.findAll();
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vozilo> getVehicleById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();

        Optional<Vozilo> vehicle = voziloRepository.findById(id);
        if(AuthorityCheck.CheckAuthority(userPrincipal, "korisnik")){
            if(vehicle.isPresent() && Objects.equals(vehicle.get().getKorisnik().getIdKorisnik(), userPrincipal.getId())){
                return ResponseEntity.ok(vehicle.get());
            }
            else return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        else return voziloRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Vozilo> createVehicle(@RequestBody Vozilo newVozilo, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(voziloRepository.save(newVozilo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vozilo> updateVehicle(@PathVariable Integer id, @RequestBody Vozilo updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();

        Optional<Vozilo> vozilo = voziloRepository.findById(id);

        if(vozilo.isPresent()){
            if(AuthorityCheck.CheckAuthority(userPrincipal, "korisnik")){
                if(!Objects.equals(vozilo.get().getKorisnik().getIdKorisnik(), userPrincipal.getId())){
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
            }

            Vozilo existing = vozilo.get();

            existing.setKorisnik(updated.getKorisnik());
            existing.setVrstaVozila(updated.getVrstaVozila());
            existing.setRegOznaka(updated.getRegOznaka());
            existing.setGodinaProizvodnje(updated.getGodinaProizvodnje());
            existing.setSerijskiBroj(updated.getSerijskiBroj());
            existing.setJeZamjensko(updated.getJeZamjensko());

            return ResponseEntity.ok(voziloRepository.save(existing));
        }
        else return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();
        if (!voziloRepository.existsById(id)) return ResponseEntity.notFound().build();

        boolean success = false;
        try{
            Optional<Vozilo> vozilo = voziloRepository.findById(id);
            if(vozilo.isPresent()){
                if(AuthorityCheck.CheckAuthority(userPrincipal, "korisnik")){
                    if(!Objects.equals(vozilo.get().getKorisnik().getIdKorisnik(), userPrincipal.getId())){
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                    }
                }

                voziloRepository.deleteById(id);
                success = true;
            } else ResponseEntity.notFound().build();
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}