package hr.fer.progi.autoservis.model;

import jakarta.persistence.*;

@Entity
@Table(name = "testing")
public class TestingModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String value;

    public TestingModel() {}
    public TestingModel(String value){
        this.value = value;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
