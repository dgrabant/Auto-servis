package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.dto.KorisnikCreateDto;
import hr.fer.progi.autoservis.dto.KorisnikUpdateDto;
import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.repository.KorisnikRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.AuthorityCheck;
import hr.fer.progi.autoservis.service.KorisnikService;
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

    public KorisnikController(KorisnikService userService, KorisnikRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Korisnik>> getAllUsers(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(!AuthorityCheck.CheckAuthority(userPrincipal, "admin")) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<Korisnik> users = userRepository.findAll();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/about")
    public ResponseEntity<Map<String, Object>> getUserById(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!AuthorityCheck.CheckAuthority(userPrincipal)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Korisnik> userOptional = userRepository.findById(userPrincipal.getId());
        if(userOptional.isEmpty()) return ResponseEntity.badRequest().build();
        Korisnik user = userOptional.get();
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("ime", user.getIme());
        responseMap.put("prezime", user.getPrezime());
        responseMap.put("email", user.getEmail());
        responseMap.put("davateljUsluge", user.getDavateljUsluge());
        responseMap.put("uloga", user.getUloga());

        return ResponseEntity.ok(responseMap);
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
            return ResponseEntity.ok(userRepository.save(new Korisnik(korisnikCreateDto)));
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
