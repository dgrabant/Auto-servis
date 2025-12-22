package hr.fer.progi.autoservis.service;

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
}
