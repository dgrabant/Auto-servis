package hr.fer.progi.autoservis.repository;

import hr.fer.progi.autoservis.model.Servisiranje;
import hr.fer.progi.autoservis.service.ServisiranjeKompozit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServisiranjeRepository extends JpaRepository<Servisiranje, ServisiranjeKompozit> {
}
