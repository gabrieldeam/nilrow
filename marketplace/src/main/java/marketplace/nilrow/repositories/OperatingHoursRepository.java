package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.OperatingHours;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperatingHoursRepository extends JpaRepository<OperatingHours, String> {
}
