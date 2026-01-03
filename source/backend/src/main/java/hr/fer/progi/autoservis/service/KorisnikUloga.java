package hr.fer.progi.autoservis.service;

import java.util.Objects;

public enum KorisnikUloga {
    KORISNIK("korisnik"),
    SERVISER("serviser"),
    UPRAVITELJ("upravitelj"),
    ADMINISTRATOR("admin");

    private final String value;

    KorisnikUloga(String value){
        this.value = value;
    }

    public String getValue(){
        return value;
    }

    public static boolean exists(String value) {
        for (KorisnikUloga o : values()) {
            if (Objects.equals(o.value, value)) {
                return true;
            }
        }
        return false;
    }
}
