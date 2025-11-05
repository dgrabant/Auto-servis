package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.Services;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.ServicesService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usluge")
public class ServicesController {

    private final ServicesService servicesService;

    public ServicesController(ServicesService servicesService){
        this.servicesService = servicesService;
    }

    @GetMapping("")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> getAllParts(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(userPrincipal==null){
            Map<String, Object> error = new HashMap<>();
            error.put("status",401);
            return error;
        }

        Map<String, Object> partsDetails = new HashMap<>();
        partsDetails.put("status",200);

        List<Services> parts = servicesService.getAllServices();
        partsDetails.put("usluge", parts);

        return partsDetails;
    }
}
