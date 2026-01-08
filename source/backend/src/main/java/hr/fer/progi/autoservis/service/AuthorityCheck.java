package hr.fer.progi.autoservis.service;

import hr.fer.progi.autoservis.security.UserPrincipal;

import java.util.Objects;

public class AuthorityCheck {
    public static boolean CheckAuthority(UserPrincipal userPrincipal, String... roles ){
        // PRIVREMENO DOPUŠTENJE SVIM KORISNICIMA
        return true;
        /*
        if(roles.length == 0) return userPrincipal!=null;

        if(userPrincipal != null) {
            boolean match = false;
            for (String role : roles) {
                String auth = Objects.requireNonNull(userPrincipal.getAuthorities().stream().findFirst().orElse(null)).getAuthority();
                if (auth.equals(role)) {
                    match = true;
                    break;
                }
            }

            return match;
        }

        return false;

         */
    }
}
