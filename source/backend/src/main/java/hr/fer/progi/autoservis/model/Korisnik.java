package hr.fer.progi.autoservis.model;

import hr.fer.progi.autoservis.service.KorisnikUloga;
import hr.fer.progi.autoservis.service.PopravakStatus;
import jakarta.persistence.*;

import java.util.Arrays;
import java.util.List;

@Entity
@Table(name="korisnik")
public class Korisnik {
    @Id
    @Column(name="idKorisnik")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idKorisnik;

    @Column(nullable = false, length = 50)
    private String ime;

    @Column(nullable = false, length = 50)
    private String prezime;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name="davateljUsluge", nullable = false, length = 20)
    private String davateljUsluge = "unknown";

    @Column(nullable = false, length = 20)
    private String uloga;

    public Integer getIdKorisnik() {
        return idKorisnik;
    }

    public String getIme() {
        return ime;
    }
    public void setIme(String ime) {
        if(ime==null) return;
        if(ime.isEmpty() || ime.length()>50) throw new RuntimeException();
        else this.ime = ime;
    }

    public String getPrezime() {
        return prezime;
    }
    public void setPrezime(String prezime) {
        if(prezime==null) return;
        if(prezime.isEmpty() || prezime.length()>50) throw new RuntimeException();
        else this.prezime = prezime;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        if(email==null) return;
        if(email.isEmpty() || email.length()>100) throw new RuntimeException();
        else this.email = email;
    }

    public String getDavateljUsluge() {
        return davateljUsluge;
    }
    public void setDavateljUsluge(String davateljUsluge) {
        if(davateljUsluge==null) return;
        if(davateljUsluge.isEmpty() || davateljUsluge.length()>20) throw new RuntimeException();
        else this.davateljUsluge = davateljUsluge;
    }

    public KorisnikUloga getUloga() {
        KorisnikUloga uloga;

        try{
            uloga = KorisnikUloga.valueOf(this.uloga);
        }
        catch (Exception e){
            throw new RuntimeException();
        }

        return uloga;
    }
    public void setUloga(KorisnikUloga uloga) {
        if(uloga==null) return;

        List<String> values = Arrays.stream(KorisnikUloga.values()).map(KorisnikUloga::getValue).toList();
        String strStatus = uloga.getValue();

        if(values.contains(strStatus)){
            this.uloga = strStatus;
        } else throw new RuntimeException();
    }
}
