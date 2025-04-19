package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.shipping.freeshipping.FreeShipping;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FreeShippingRepository extends JpaRepository<FreeShipping, String> {
    Optional<FreeShipping> findByCatalogId(String catalogId);
}