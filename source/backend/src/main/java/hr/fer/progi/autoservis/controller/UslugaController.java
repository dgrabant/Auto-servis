package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Usluga;
import hr.fer.progi.autoservis.repository.UslugaRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usluga")
public class UslugaController {

    private final UslugaRepository uslugaRepository;

    public UslugaController(UslugaRepository uslugaRepository){
        this.uslugaRepository = uslugaRepository;
    }

    /*@GetMapping("")
    public Map<String, Object> getAllServices(){
        Map<String, Object> servicesDetails = new HashMap<>();
        servicesDetails.put("status",200);

        List<Usluga> services = servicesService.getAllServices();
        servicesDetails.put("usluge", services);

        return servicesDetails;
    }*/

    @GetMapping
    public List<Usluga> getAllServices() {
        return uslugaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usluga> getServiceById(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return uslugaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public Usluga create(@RequestBody Usluga newUsluga) {
        return uslugaRepository.save(newUsluga);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public ResponseEntity<Usluga> updateService(@PathVariable Integer id, @RequestBody Usluga updated, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        return uslugaRepository.findById(id)
                .map(existing -> {
                    existing.setNaziv(updated.getNaziv());
                    existing.setCijena(updated.getCijena());
                    existing.setOpis(updated.getOpis());
                    existing.setSlikaUrl(updated.getSlikaUrl());
                    return ResponseEntity.ok(uslugaRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RADNIK','UPRAVITELJ','ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if(userPrincipal==null) return ResponseEntity.badRequest().build();
        if (!uslugaRepository.existsById(id)) return ResponseEntity.notFound().build();
        uslugaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
