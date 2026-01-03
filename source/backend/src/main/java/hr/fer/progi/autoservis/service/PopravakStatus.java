package hr.fer.progi.autoservis.service;

import java.util.Objects;

public enum PopravakStatus {
    UPRIPREMI("u pripremi"),
    UTIJEKU("u tijeku"),
    ODBIJENO("odbijeno"),
    ZAVRSENO("završeno");

    private final String value;

    PopravakStatus(String value){
        this.value = value;
    }

    public String getValue(){
        return value;
    }

    public static boolean exists(String value) {
        for (PopravakStatus o : values()) {
            if (Objects.equals(o.value, value)) {
                return true;
            }
        }
        return false;
    }
}
