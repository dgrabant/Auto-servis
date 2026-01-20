package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.PopravakCreateDto;
import hr.fer.progi.autoservis.dto.PopravakUpdateDto;
import hr.fer.progi.autoservis.model.*;
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

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/popravak")
public class PopravakController {
    private final PopravakRepository popravakRepository;
    private final VoziloRepository voziloRepository;
    private final TerminRepository terminRepository;

    private final ServisiranjeRepository servisiranjeRepository;
    private final KorisnikRepository korisnikRepository;

    public PopravakController(PopravakRepository popravakRepository, VoziloRepository voziloRepository, TerminRepository terminRepository, ServisiranjeRepository servisiranjeRepository, KorisnikRepository korisnikRepository){
        this.popravakRepository = popravakRepository;
        this.voziloRepository = voziloRepository;
        this.terminRepository = terminRepository;
        this.servisiranjeRepository = servisiranjeRepository;
        this.korisnikRepository = korisnikRepository;
    }

    @GetMapping
    public ResponseEntity<List<Popravak>> getAll(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")) {
            List<Servisiranje> servisiranja = servisiranjeRepository.findAll();
            List<Popravak> sorted = new ArrayList<>();

            for (Servisiranje servisiranje : servisiranja) {
                Korisnik korisnik = servisiranje.getKorisnik();
                if (korisnik != null && Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId())) {
                    sorted.add(servisiranje.getPopravak());
                }
            }

            return ResponseEntity.ok(sorted);
        }

        return ResponseEntity.ok(popravakRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Popravak> getById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")){
            Popravak popravak = popravakRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
            Korisnik korisnik = korisnikRepository.findById(userPrincipal.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
            ServisiranjeKompozit servisiranjeKompozit = new ServisiranjeKompozit(popravak, korisnik);

            Optional<Servisiranje> servisiranje = servisiranjeRepository.findById(servisiranjeKompozit);
            if(servisiranje.isPresent()){
                return ResponseEntity.ok(popravak);
            }
            else return ResponseEntity.badRequest().build();
        }

        return popravakRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping
    public ResponseEntity<Popravak> create(@Valid @RequestBody PopravakCreateDto popravakDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Vozilo vozilo = voziloRepository.findById(popravakDto.getIdVozila()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        Termin termin = terminRepository.findById(popravakDto.getIdTermin()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        Popravak popravak = new Popravak(popravakDto);
        popravak.setVozilo(vozilo);
        popravak.setTermin(termin);

        Korisnik korisnik = termin.getKorisnik();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser") && !Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        ZonedDateTime datumVrijeme = null;
        try {
            if(popravakDto.getDatumVrijeme() != null) datumVrijeme = ZonedDateTime.parse(popravakDto.getDatumVrijeme());
        }
        catch (Exception e){
            return ResponseEntity.badRequest().build();
        }
        popravak.setDatumVrijeme(datumVrijeme);

        try {
            popravak = popravakRepository.save(popravak);
            servisiranjeRepository.save(new Servisiranje(popravak, korisnik));

            return ResponseEntity.ok(popravak);
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Popravak> update(@PathVariable Integer id, @Valid @RequestBody PopravakUpdateDto popravakDto, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(popravakDto.getIdVozila() == null && popravakDto.getIdTermin() == null && popravakDto.getStanje() == null && popravakDto.getOpis() == null) return ResponseEntity.badRequest().build();

        Optional<Popravak> existing = popravakRepository.findById(id);
        if(existing.isPresent()){
            if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")){
                Korisnik korisnik = korisnikRepository.findById(userPrincipal.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR));
                ServisiranjeKompozit servisiranjeKompozit = new ServisiranjeKompozit(existing.get(), korisnik);
                if(!servisiranjeRepository.existsById(servisiranjeKompozit)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            Vozilo vozilo = voziloRepository.findById(popravakDto.getIdVozila()).orElse(null);
            Termin termin = terminRepository.findById(popravakDto.getIdTermin()).orElse(null);

            if(vozilo != null) existing.get().setVozilo(vozilo);
            if(termin != null) existing.get().setTermin(termin);
            if(popravakDto.getStanje() != null) existing.get().setStanje(popravakDto.getStanje());
            if(popravakDto.getOpis() != null) existing.get().setOpis(popravakDto.getOpis());

            ZonedDateTime datumVrijeme = null;
            try {
                if(popravakDto.getDatumVrijeme() != null) datumVrijeme = ZonedDateTime.parse(popravakDto.getDatumVrijeme());
            }
            catch (Exception e){
                return ResponseEntity.badRequest().build();
            }
            existing.get().setDatumVrijeme(datumVrijeme);

            try {
                return ResponseEntity.ok(popravakRepository.save(existing.get()));
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

        if (!popravakRepository.existsById(id)) return ResponseEntity.badRequest().build();

        boolean success = false;
        try{
            popravakRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
