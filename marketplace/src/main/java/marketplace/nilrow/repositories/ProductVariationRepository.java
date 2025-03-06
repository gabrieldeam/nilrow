package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.catalog.product.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, String> {
}
