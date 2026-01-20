package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.KorisnikCreateDto;
import hr.fer.progi.autoservis.dto.KorisnikUpdateDto;
import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.repository.KorisnikRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import hr.fer.progi.autoservis.service.KorisnikService;
import hr.fer.progi.autoservis.service.MailingAgent;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/korisnik")
public class KorisnikController {

    private final KorisnikService userService;
    private final KorisnikRepository userRepository;
    private final MailingAgent mailingAgent;

    public KorisnikController(KorisnikService userService, KorisnikRepository userRepository, MailingAgent mailingAgent) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailingAgent = mailingAgent;
    }

    @GetMapping
    public ResponseEntity<List<Korisnik>> getAllUsers(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "upravitelj", "admin")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<Korisnik> users = userRepository.findAll();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/about")
    public ResponseEntity<Korisnik> getUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return userRepository.findById(userPrincipal.getId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Korisnik> getUserById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "serviser", "upravitelj", "admin")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PostMapping
    public ResponseEntity<Korisnik> createUser(@Valid @RequestBody KorisnikCreateDto korisnikCreateDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "admin")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Korisnik korisnik = userRepository.save(new Korisnik(korisnikCreateDto));

            try{
                mailingAgent.send(korisnikCreateDto.getEmail(), "Dobrodošli!", "Pozdrav i hvala na registraciji na naš Auto-servis Harlemova kočija!", "");
            }
            catch (Exception e){
                System.out.println("Pogreška prilikom slanja emaila pri registraciji za korisnika: "+korisnikCreateDto.getEmail());
            }

            return ResponseEntity.ok(korisnik);
        }
        catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Korisnik> updateUser(@PathVariable Integer id, @Valid @RequestBody KorisnikUpdateDto korisnikDto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "admin")) return ResponseEntity.status(401).build();

        Optional<Korisnik> existing = userRepository.findById(id);
        if(existing.isPresent()){
            if(korisnikDto.getIme() != null) existing.get().setIme(korisnikDto.getIme());
            if(korisnikDto.getPrezime() != null) existing.get().setPrezime(korisnikDto.getPrezime());
            if(korisnikDto.getEmail() != null) existing.get().setEmail(korisnikDto.getEmail());
            if(korisnikDto.getDavateljUsluge() != null) existing.get().setDavateljUsluge(korisnikDto.getDavateljUsluge());
            if(korisnikDto.getUloga() != null) existing.get().setUloga(korisnikDto.getUloga());

            try {
                return ResponseEntity.ok(userRepository.save(existing.get()));
            }
            catch (Exception e){
                return ResponseEntity.internalServerError().build();
            }
        }
        else return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "admin")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!userRepository.existsById(id)) return ResponseEntity.badRequest().build();

        boolean success = false;
        try{
            userRepository.deleteById(id);
            success = true;
        }
        catch (Exception ignored){ }
        return (success?ResponseEntity.ok():ResponseEntity.internalServerError()).build();
    }
}
