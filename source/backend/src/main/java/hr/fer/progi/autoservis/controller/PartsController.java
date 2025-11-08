package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Parts;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.PartsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dijelovi")
public class PartsController {

    private final PartsService partsService;

    public PartsController(PartsService partsService){
        this.partsService = partsService;
    }

    @GetMapping("")
    public Map<String, Object> getAllParts(){
        Map<String, Object> partsDetails = new HashMap<>();
        partsDetails.put("status",200);

        List<Parts> parts = partsService.getAllParts();
        partsDetails.put("dijelovi", parts);

        return partsDetails;
    }
}
