package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.repository.KorisnikRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.KorisnikService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Korisnik> getAllUsers(@AuthenticationPrincipal UserPrincipal userPrincipal){
        return userRepository.findAll();
    }

    @GetMapping("/about")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUserById(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();

        Optional<Korisnik> userOptional = userRepository.findById(userPrincipal.getId());
        if(userOptional.isEmpty()) return ResponseEntity.notFound().build();
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
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Korisnik> getUserById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public Korisnik createUser(@RequestBody Korisnik newKorisnik, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return userRepository.save(newKorisnik);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Korisnik> updateUser(@PathVariable Integer id, @RequestBody Korisnik updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setIme(updated.getIme());
                    existing.setPrezime(updated.getPrezime());
                    existing.setEmail(updated.getEmail());
                    existing.setDavateljUsluge(updated.getDavateljUsluge());
                    existing.setUloga(updated.getUloga());
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
