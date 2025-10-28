package hr.fer.progi.autoservis.repository;

import hr.fer.progi.autoservis.model.TestingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestingRepository extends JpaRepository<TestingModel, Long> {
}
