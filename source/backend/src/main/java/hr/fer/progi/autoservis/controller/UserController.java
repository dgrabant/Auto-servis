package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.User;
import hr.fer.progi.autoservis.security.UserPrincipal;
import hr.fer.progi.autoservis.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/info")
    @PreAuthorize("hasRole('KORISNIK')")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal){
        if(userPrincipal==null){
            Map<String, Object> error = new HashMap<>();
            error.put("status",401);
            return error;
        }

        Long userId = userPrincipal.getId();
        User user = userService.getUserById(userId);

        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("idKorisnika", user.getIdKorisnika());
        userDetails.put("email", user.getEmail());
        userDetails.put("ime", user.getIme());
        userDetails.put("prezime", user.getPrezime());
        userDetails.put("davateljUsluge", user.getDavateljUsluge());
        userDetails.put("uloga", user.getUloga());
        userDetails.put("status",200);
        return userDetails;
    }
}
