package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.repository.KorisnikRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.KorisnikService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        if(!CheckAuthority(userPrincipal, "ADMIN")) return ResponseEntity.status(401).build();
        List<Korisnik> users = userRepository.findAll();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/about")
    public ResponseEntity<Map<String, Object>> getUserById(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.status(401).build();

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
    public ResponseEntity<Korisnik> getUserById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.status(401).build();
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Korisnik> createUser(@RequestBody Korisnik newKorisnik, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(userRepository.save(newKorisnik));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Korisnik> updateUser(@PathVariable Integer id, @RequestBody Korisnik updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.status(401).build();
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
        if(!CheckAuthority(userPrincipal)) return ResponseEntity.status(401).build();
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();

        boolean success = false;
        try{
            userRepository.deleteById(id);
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
