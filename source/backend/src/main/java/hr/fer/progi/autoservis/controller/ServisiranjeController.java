package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.RadnjaCreateDto;
import hr.fer.progi.autoservis.dto.ServisiranjeDto;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/servisiranje")
public class ServisiranjeController {
    private final ServisiranjeRepository servisiranjeRepository;
    private final PopravakRepository popravakRepository;
    private final KorisnikRepository korisnikRepository;

    public ServisiranjeController(ServisiranjeRepository servisiranjeRepository, PopravakRepository popravakRepository, KorisnikRepository korisnikRepository){
        this.servisiranjeRepository = servisiranjeRepository;
        this.popravakRepository = popravakRepository;
        this.korisnikRepository = korisnikRepository;
    }

    @GetMapping
    public ResponseEntity<List<Servisiranje>> getAll(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser")) {
            List<Servisiranje> servisiranja = servisiranjeRepository.findAll();
            List<Servisiranje> sorted = new ArrayList<>();

            for (Servisiranje servisiranje : servisiranja) {
                Korisnik korisnik = servisiranje.getKorisnik();
                if (korisnik != null && Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId())) {
                    sorted.add(servisiranje);
                }
            }

            return ResponseEntity.ok(sorted);
        }

        return ResponseEntity.ok(servisiranjeRepository.findAll());
    }

    @GetMapping("/{id1}.{id2}")
    public ResponseEntity<Servisiranje> getById(@PathVariable Integer id1, @PathVariable Integer id2, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Popravak popravak = popravakRepository.findById(id1).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        Korisnik korisnik = korisnikRepository.findById(id2).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser") && !Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        ServisiranjeKompozit servisiranjeKompozit = new ServisiranjeKompozit(popravak, korisnik);
        return servisiranjeRepository.findById(servisiranjeKompozit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping
    public ResponseEntity<Servisiranje> create(@Valid @RequestBody ServisiranjeDto servisiranjeDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Popravak popravak = popravakRepository.findById(servisiranjeDto.getIdPopravak()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        Korisnik korisnik = korisnikRepository.findById(servisiranjeDto.getIdKorisnik()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser") && !Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Servisiranje servisiranje = new Servisiranje(popravak, korisnik);

        try {
            return ResponseEntity.ok(servisiranjeRepository.save(servisiranje));
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id1}.{id2}")
    public ResponseEntity<Servisiranje> update(@PathVariable Integer id1, @PathVariable Integer id2, @Valid @RequestBody ServisiranjeDto servisiranjeDto, @AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Popravak popravak = popravakRepository.findById(id1).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        Korisnik korisnik = korisnikRepository.findById(id2).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        if(AuthorityCheck.CheckAuthority(userPrincipal, "serviser") && !Objects.equals(korisnik.getIdKorisnik(), userPrincipal.getId()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        ServisiranjeKompozit servisiranjeKompozit = new ServisiranjeKompozit(popravak, korisnik);
        Optional<Servisiranje> existing = servisiranjeRepository.findById(servisiranjeKompozit);
        if(existing.isPresent()){
            Popravak popravak_dto = popravakRepository.findById(servisiranjeDto.getIdPopravak()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
            Korisnik korisnik_dto = korisnikRepository.findById(servisiranjeDto.getIdKorisnik()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

            try {
                servisiranjeRepository.deleteById(servisiranjeKompozit);
                Servisiranje servisiranje = new Servisiranje(popravak_dto, korisnik_dto);

                return ResponseEntity.ok(servisiranjeRepository.save(servisiranje));
            }
            catch (Exception e){
                return ResponseEntity.internalServerError().build();
            }
        }
        else return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id1}.{id2}")
    public ResponseEntity<Void> delete(@PathVariable Integer id1, @PathVariable Integer id2, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin"))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Popravak popravak = popravakRepository.findById(id1).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
        Korisnik korisnik = korisnikRepository.findById(id2).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

        ServisiranjeKompozit servisiranjeKompozit = new ServisiranjeKompozit(popravak, korisnik);

        if (!servisiranjeRepository.existsById(servisiranjeKompozit)) return ResponseEntity.badRequest().build();

        boolean success = false;
        try{
            servisiranjeRepository.deleteById(servisiranjeKompozit);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
