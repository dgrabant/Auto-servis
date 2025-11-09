package hr.fer.progi.autoservis.repository;

import hr.fer.progi.autoservis.model.Vozilo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoziloRepository extends JpaRepository<Vozilo, Integer> {
}
