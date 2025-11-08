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
    public Map<String, Object> getAllServices(){
        Map<String, Object> servicesDetails = new HashMap<>();
        servicesDetails.put("status",200);

        List<Services> services = servicesService.getAllServices();
        servicesDetails.put("usluge", services);

        return servicesDetails;
    }
}
