package hr.fer.progi.autoservis.repository;

import hr.fer.progi.autoservis.model.Termin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TerminRepository extends JpaRepository<Termin, Integer> {
}
