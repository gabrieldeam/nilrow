package marketplace.nilrow.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import marketplace.nilrow.domain.catalog.shipping.pickup.Pickup;

import java.util.Optional;

public interface PickupRepository extends JpaRepository<Pickup, String> {
    Optional<Pickup> findByCatalog_Id(String catalogId);

}