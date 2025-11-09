package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

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
    private String davateljUsluge;

    @Column(nullable = false, length = 10)
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

    public String getUloga() {
        return uloga;
    }
    public void setUloga(String uloga) {
        if(uloga==null) return;
        if(uloga.isEmpty() || uloga.length()>10) throw new RuntimeException();
        else this.uloga = uloga;
    }
}
