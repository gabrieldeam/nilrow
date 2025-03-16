package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.shipping.delivery.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, String> {
}