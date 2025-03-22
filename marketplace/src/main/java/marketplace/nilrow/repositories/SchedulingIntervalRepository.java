package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.shipping.scheduling.SchedulingInterval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchedulingIntervalRepository extends JpaRepository<SchedulingInterval, String> {

    /**
     * Busca todos os intervalos pertencentes a um Scheduling específico.
     */
    List<SchedulingInterval> findByScheduling_Id(String schedulingId);
}
