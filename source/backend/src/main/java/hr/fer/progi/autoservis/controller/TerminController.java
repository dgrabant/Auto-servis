package hr.fer.progi.autoservis.controller;


import hr.fer.progi.autoservis.dto.TerminCreateDto;
import hr.fer.progi.autoservis.dto.TerminUpdateDto;
import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.model.Popravak;
import hr.fer.progi.autoservis.model.Termin;
import hr.fer.progi.autoservis.repository.KorisnikRepository;
import hr.fer.progi.autoservis.repository.TerminRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/termin")
public class TerminController {
    private final TerminRepository terminRepository;
    private final KorisnikRepository korisnikRepository;

    public TerminController(TerminRepository terminRepository, KorisnikRepository korisnikRepository){
        this.terminRepository = terminRepository;
        this.korisnikRepository = korisnikRepository;
    }

    @GetMapping
    public ResponseEntity<List<Termin>> getAll(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")){
            List<Termin> termini = terminRepository.findAll();

            List<Termin> sorted = new ArrayList<>();

            for(Termin termin : termini){
                Korisnik korisnik = termin.getKorisnik();
                if(korisnik != null && Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId())){
                    sorted.add(termin);
                }
            }

            return ResponseEntity.ok(sorted);
        }

        return ResponseEntity.ok(terminRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Termin> getById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")){
            Optional<Termin> termin = terminRepository.findById(id);
            if(termin.isPresent()){
                Korisnik korisnik = termin.get().getKorisnik();
                if(korisnik != null && Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId())){
                    return ResponseEntity.ok(termin.get());
                }
            }
            else return ResponseEntity.badRequest().build();
        }

        return terminRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping
    public ResponseEntity<Termin> create(@Valid @RequestBody TerminCreateDto terminDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Korisnik korisnik = korisnikRepository.findById(terminDto.getIdKorisnik()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")){
            if(!Objects.equals(terminDto.getIdKorisnik(), userPrincipal.getId())) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Termin termin = new Termin();
        termin.setKorisnik(korisnik);

        ZonedDateTime datumVrijeme;
        ZonedDateTime odgoda = null;

        try{
            datumVrijeme = ZonedDateTime.parse(terminDto.getDatumVrijeme());
            if(terminDto.getOdgoda() != null){
                odgoda = ZonedDateTime.parse(terminDto.getOdgoda());
            }
        }
        catch (Exception e){
            return ResponseEntity.badRequest().build();
        }
        termin.setDatumVrijeme(datumVrijeme);
        termin.setOdgoda(odgoda);

        try {
            return ResponseEntity.ok(terminRepository.save(termin));
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Termin> update(@PathVariable Integer id, @Valid @RequestBody TerminUpdateDto terminDto, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")){
            if(!Objects.equals(terminDto.getIdKorisnik(), userPrincipal.getId())) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Termin> existing = terminRepository.findById(id);
        if(existing.isPresent()){

            if(terminDto.getIdKorisnik() == null && terminDto.getDatumVrijeme() == null && terminDto.getOdgoda() == null) return ResponseEntity.badRequest().build();

            Korisnik korisnik = null;
            if(terminDto.getIdKorisnik() != null) korisnik = korisnikRepository.findById(terminDto.getIdKorisnik()).orElse(null);

            if(korisnik != null) existing.get().setKorisnik(korisnik);

            ZonedDateTime datumVrijeme = null;
            ZonedDateTime odgoda = null;

            try{
                if(terminDto.getDatumVrijeme() != null) datumVrijeme = ZonedDateTime.parse(terminDto.getDatumVrijeme());
                if(terminDto.getOdgoda() != null){
                    odgoda = ZonedDateTime.parse(terminDto.getOdgoda());
                }
            }
            catch (Exception e){
                return ResponseEntity.badRequest().build();
            }
            if(datumVrijeme != null) existing.get().setDatumVrijeme(datumVrijeme);
            existing.get().setOdgoda(odgoda);

            try {
                return ResponseEntity.ok(terminRepository.save(existing.get()));
            }
            catch (Exception e){
                return ResponseEntity.internalServerError().build();
            }
        }
        else return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (!terminRepository.existsById(id)) return ResponseEntity.badRequest().build();

        boolean success = false;
        try{
            terminRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
