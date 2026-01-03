package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.PopravakCreateDto;
import hr.fer.progi.autoservis.dto.PopravakUpdateDto;
import hr.fer.progi.autoservis.dto.RadnjaCreateDto;
import hr.fer.progi.autoservis.model.Dijeloviusluge;
import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.model.Popravak;
import hr.fer.progi.autoservis.model.Radnja;
import hr.fer.progi.autoservis.repository.*;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import hr.fer.progi.autoservis.service.ServisiranjeKompozit;
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
@RequestMapping("/api/radnja")
public class RadnjaController {
    private final RadnjaRepository radnjaRepository;
    private final PopravakRepository popravakRepository;
    private final KorisnikRepository korisnikRepository;
    private final DijeloviuslugeRepository dijeloviuslugeRepository;

    private final ServisiranjeRepository servisiranjeRepository;

    public RadnjaController(RadnjaRepository radnjaRepository, PopravakRepository popravakRepository, KorisnikRepository korisnikRepository, DijeloviuslugeRepository dijeloviuslugeRepository, ServisiranjeRepository servisiranjeRepository){
        this.radnjaRepository = radnjaRepository;
        this.popravakRepository = popravakRepository;
        this.korisnikRepository = korisnikRepository;
        this.dijeloviuslugeRepository = dijeloviuslugeRepository;
        this.servisiranjeRepository = servisiranjeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Radnja>> getAll(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")){
            List<Radnja> radnje = radnjaRepository.findAll();
            List<Radnja> sorted = new ArrayList<>();

            for(Radnja radnja : radnje){
                Popravak popravak = radnja.getPopravak();
                Korisnik korisnik = korisnikRepository.findById(userPrincipal.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
                ServisiranjeKompozit servisiranjeKompozit = new ServisiranjeKompozit(popravak, korisnik);
                if(servisiranjeRepository.existsById(servisiranjeKompozit)){
                    sorted.add(radnja);
                }
            }

            return ResponseEntity.ok(sorted);
        }

        return ResponseEntity.ok(radnjaRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Radnja> getById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Radnja radnja = radnjaRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        Korisnik korisnik = radnja.getKorisnik();
        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser") && !Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(radnja);
    }

    @PostMapping
    public ResponseEntity<Radnja> create(@Valid @RequestBody RadnjaCreateDto radnjaDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Popravak popravak = popravakRepository.findById(radnjaDto.getIdDijelausluge()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        Korisnik korisnik = korisnikRepository.findById(radnjaDto.getIdKorisnik()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        Dijeloviusluge dijeloviusluge = dijeloviuslugeRepository.findById(radnjaDto.getIdDijelausluge()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser") && !Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Radnja radnja = new Radnja(radnjaDto);
        radnja.setPopravak(popravak);
        radnja.setKorisnik(korisnik);
        radnja.setDijeloviusluge(dijeloviusluge);

        try {
            return ResponseEntity.ok(radnjaRepository.save(radnja));
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Radnja> update(@PathVariable Integer id, @Valid @RequestBody RadnjaCreateDto radnjaDto, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Radnja> existing = radnjaRepository.findById(id);
        if(existing.isPresent()){
            Popravak popravak = popravakRepository.findById(radnjaDto.getIdDijelausluge()).orElse(null);
            Korisnik korisnik = korisnikRepository.findById(radnjaDto.getIdKorisnik()).orElse(null);
            Dijeloviusluge dijeloviusluge = dijeloviuslugeRepository.findById(radnjaDto.getIdDijelausluge()).orElse(null);

            if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser") && (korisnik==null || !Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId())))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            if(popravak != null) existing.get().setPopravak(popravak);
            if(korisnik != null) existing.get().setKorisnik(korisnik);
            if(dijeloviusluge != null) existing.get().setDijeloviusluge(dijeloviusluge);
            if(radnjaDto.getStanje() != null) existing.get().setStanje(radnjaDto.getStanje());
            if(radnjaDto.getNapomena() != null) existing.get().setStanje(radnjaDto.getNapomena());

            try {
                return ResponseEntity.ok(radnjaRepository.save(existing.get()));
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

        if (!radnjaRepository.existsById(id)) return ResponseEntity.badRequest().build();

        boolean success = false;
        try{
            radnjaRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
