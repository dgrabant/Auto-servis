package hr.fer.progi.autoservis.repository;

import hr.fer.progi.autoservis.model.Services;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicesRepository extends JpaRepository<Services, Long> {
}
