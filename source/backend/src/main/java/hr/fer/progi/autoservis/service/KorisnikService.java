package hr.fer.progi.autoservis.service;

import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.repository.KorisnikRepository;
import hr.fer.progi.autoservis.security.UserPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class KorisnikService {

    private final KorisnikRepository korisnikRepository;

    public KorisnikService(KorisnikRepository korisnikRepository) {
        this.korisnikRepository = korisnikRepository;
    }

    public UserDetails loadUserById(Integer id) {
        Korisnik user = korisnikRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("Korisnik s idKorisnika "+id+" nije pronaden!"));
        return UserPrincipal.create(user);
    }

    public Korisnik processOAuth2User(OAuth2User oauthUser) {
        Map<String, Object> attributes = oauthUser.getAttributes();

        String email = getEmailFromAttributes(attributes);
        String[] name = ((String)attributes.get("name")).split(" ");
        String firstname = name[0];
        String lastname = name[name.length-1];

        if (email == null) {
            throw new RuntimeException("Email nije pronaden kod korisnika!");
        }

        Optional<Korisnik> userOptional = korisnikRepository.findByEmail(email);
        Korisnik user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setIme(firstname);
            user.setPrezime(lastname);
            user.setDavateljUsluge(getProviderFromAttributes(attributes));
        } else {
            user = new Korisnik();
            user.setEmail(email);
            user.setIme(firstname);
            user.setPrezime(lastname);
            user.setDavateljUsluge(getProviderFromAttributes(attributes));
            user.setUloga("KORISNIK");
        }

        return korisnikRepository.save(user);
    }

    public Korisnik getUserById(Integer id){
        return korisnikRepository.findById(id).orElseThrow(()->new RuntimeException("Korisnik (idKorisnika "+id+") je pronaden preko tokena, ali ne postoji u bazi podataka!"));
    }

    private String getEmailFromAttributes(Map<String, Object> attributes) {
        String candidate = (String) attributes.get("email");
        if(candidate == null) candidate = (String) attributes.get("login");
        return candidate;
    }

    private String getProviderFromAttributes(Map<String, Object> attributes) {
        if(attributes.containsKey("sub")) return "google";
        if(attributes.containsKey("login")) return "github";
        return "unknown";
    }
}