package hr.fer.progi.autoservis.repository;

import hr.fer.progi.autoservis.model.Parts;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartsRepository extends JpaRepository<Parts, Long> {
}
