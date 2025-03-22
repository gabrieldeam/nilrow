package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.shipping.scheduling.Scheduling;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchedulingRepository extends JpaRepository<Scheduling, String> {
    List<Scheduling> findByCatalog_Id(String catalogId);
}
