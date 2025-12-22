package hr.fer.progi.autoservis.service;

public enum RadnjaStatus {
    NEPOTRVDENO("nepotvrđeno"),
    POTVRDENO("potvrđeno"),
    ZAVRSENO("završeno");

    private final String value;

    RadnjaStatus(String value){
        this.value = value;
    }

    public String getValue(){
        return value;
    }
}
