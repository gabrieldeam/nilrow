package marketplace.nilrow.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import marketplace.nilrow.domain.catalog.shipping.pickup.Pickup;

public interface PickupRepository extends JpaRepository<Pickup, String> {
}