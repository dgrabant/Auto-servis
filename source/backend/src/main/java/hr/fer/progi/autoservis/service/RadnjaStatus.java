package hr.fer.progi.autoservis.service;

import java.util.Objects;

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

    public static boolean exists(String value) {
        for (RadnjaStatus o : values()) {
            if (Objects.equals(o.value, value)) {
                return true;
            }
        }
        return false;
    }
}
