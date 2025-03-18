package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.shipping.delivery.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, String> {
    Optional<Delivery> findByCatalogId(String catalogId);
}