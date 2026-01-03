package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.VoziloCreateDto;
import hr.fer.progi.autoservis.dto.VoziloUpdateDto;
import hr.fer.progi.autoservis.model.*;
import hr.fer.progi.autoservis.repository.KorisnikRepository;
import hr.fer.progi.autoservis.repository.VoziloRepository;
import hr.fer.progi.autoservis.repository.VrstaVozilaRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/vozilo")
public class VoziloController {
    private final VoziloRepository voziloRepository;
    private final KorisnikRepository korisnikRepository;
    private final VrstaVozilaRepository vrstaVozilaRepository;

    public VoziloController(VoziloRepository voziloRepository, KorisnikRepository korisnikRepository, VrstaVozilaRepository vrstaVozilaRepository) {
        this.voziloRepository = voziloRepository;
        this.korisnikRepository = korisnikRepository;
        this.vrstaVozilaRepository = vrstaVozilaRepository;
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
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping
    public ResponseEntity<Vozilo> createVehicle(@Valid @RequestBody VoziloCreateDto voziloDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();

        Korisnik korisnik = korisnikRepository.findById(voziloDto.getIdKorisnik()).orElseThrow(null);
        VrstaVozila vrstaVozila = vrstaVozilaRepository.findById(voziloDto.getIdVrsta()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        Vozilo newVozilo = new Vozilo(voziloDto);
        newVozilo.setKorisnik(korisnik);
        newVozilo.setVrstaVozila(vrstaVozila);

        if(newVozilo.getJeZamjensko()) newVozilo.setKorisnik(null);
        else{
            if(korisnik == null) return ResponseEntity.badRequest().build();
        }

        try {
            return ResponseEntity.ok(voziloRepository.save(newVozilo));
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vozilo> updateVehicle(@PathVariable Integer id, @Valid @RequestBody VoziloUpdateDto voziloDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.badRequest().build();

        Optional<Vozilo> vozilo = voziloRepository.findById(id);
        if(vozilo.isPresent()){
            if(AuthorityCheck.CheckAuthority(userPrincipal, "korisnik")){
                if(!Objects.equals(vozilo.get().getKorisnik().getIdKorisnik(), userPrincipal.getId())){
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
            }

            Vozilo existing = vozilo.get();

            Korisnik korisnik = korisnikRepository.findById(voziloDto.getIdKorisnik()).orElseThrow(null);
            VrstaVozila vrstaVozila = vrstaVozilaRepository.findById(voziloDto.getIdVrsta()).orElseThrow(null);

            if(voziloDto.getJeZamjensko() != null) existing.setJeZamjensko(voziloDto.getJeZamjensko());

            if(existing.getJeZamjensko()) korisnik = null;
            else{
                if(korisnik == null) return ResponseEntity.badRequest().build();
            }

            existing.setKorisnik(korisnik); // potencijalni problem: ako azuriramo vozilo i ne brisemo korisnika, moramo uvijek navesti id korisnika kako ga ne bi obrisao iz vozila
            if(vrstaVozila != null)  existing.setVrstaVozila(vrstaVozila);
            if(voziloDto.getRegOznaka() != null) existing.setRegOznaka(voziloDto.getRegOznaka());
            if(voziloDto.getGodinaProizvodnje() != null) existing.setGodinaProizvodnje(voziloDto.getGodinaProizvodnje());
            if(voziloDto.getSerijskiBroj() != null) existing.setSerijskiBroj(voziloDto.getSerijskiBroj());

            try {
                return ResponseEntity.ok(voziloRepository.save(existing));
            }
            catch (Exception e){
                return ResponseEntity.internalServerError().build();
            }
        }
        else return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!voziloRepository.existsById(id)) return ResponseEntity.badRequest().build();

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
            } else ResponseEntity.badRequest().build();
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}