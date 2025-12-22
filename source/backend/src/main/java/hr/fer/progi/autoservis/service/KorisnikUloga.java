package hr.fer.progi.autoservis.service;

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
}
