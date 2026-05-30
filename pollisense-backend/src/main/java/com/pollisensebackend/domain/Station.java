package com.pollisensebackend.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stations")
public class Station {

    @Id
    private String id;

    private String name;
    private String site;
    private String habitat;
    private double latitude;
    private double longitude;

    protected Station() {
    }

    public Station(String id, String name, String site, String habitat, double latitude, double longitude) {
        this.id = id;
        this.name = name;
        this.site = site;
        this.habitat = habitat;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSite() {
        return site;
    }

    public String getHabitat() {
        return habitat;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }
}
