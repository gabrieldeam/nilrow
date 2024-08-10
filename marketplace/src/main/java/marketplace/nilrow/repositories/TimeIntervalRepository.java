package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.TimeInterval;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeIntervalRepository extends JpaRepository<TimeInterval, String> {
}
