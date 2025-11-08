package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vozilo")
public class VehicleController {

    private record VehicleSubmitRequest(
            int idVrsta,
            String regOznaka,
            short godinaProizvodnje,
            String serijskiBr
    ){}

    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> handleVehicleSubmit(@AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody VehicleSubmitRequest body)
    {
        Map<String, Object> response = new HashMap<>();
        response.put("status",200);

        Map<String, Object> object = new HashMap<>();
        object.put("idVrsta",body.idVrsta());
        object.put("regOznaka",body.regOznaka());
        object.put("godinaProizvodnje",body.godinaProizvodnje());
        object.put("serijskiBr",body.serijskiBr());

        response.put("object", object);

        return response;
    }
}